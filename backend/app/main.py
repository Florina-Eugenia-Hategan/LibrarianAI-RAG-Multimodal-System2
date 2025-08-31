"""
Entry point for FastAPI backend.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
import json
import openai
from app.utils import pdf_utils, docx_utils, web_utils
from app.rag_pipeline import add_document, search_similar, generate_answer, get_summary_by_title
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
import wave

app = FastAPI()

# CORS pentru frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transcribe-audio/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Download Vosk model if not present (en-US)
    model_path = "vosk-model-en-us-0.22"
    if not os.path.exists(model_path):
        raise HTTPException(status_code=500, detail="Vosk model not found. Download from https://alphacephei.com/vosk/models and unzip to backend/app/")
    model = Model(model_path)
    # Save uploaded file
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    # Convert to WAV mono 16kHz if needed
    audio = AudioSegment.from_file(temp_path)
    audio = audio.set_channels(1).set_frame_rate(16000)
    wav_path = temp_path + ".wav"
    audio.export(wav_path, format="wav")
    wf = wave.open(wav_path, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)
    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            results.append(rec.Result())
    results.append(rec.FinalResult())
    transcript = " ".join([json.loads(r).get("text","") for r in results])
    wf.close()
    os.remove(temp_path)
    os.remove(wav_path)
    return {"transcript": transcript}
# main.py
"""
Entry point for FastAPI backend.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import openai
from .utils import pdf_utils, docx_utils, web_utils
from .rag_pipeline import add_document, search_similar, generate_answer, get_summary_by_title


app = FastAPI()

# CORS pentru frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "RAG backend is running!"}

# Endpoint pentru upload fișiere
@app.post("/upload-file/")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    ext = filename.split('.')[-1].lower()
    content = await file.read()
    text = ""
    if ext == "pdf":
        text = pdf_utils.extract_text_from_pdf_bytes(content)
    elif ext == "docx":
        text = docx_utils.extract_text_from_docx_bytes(content)
    elif ext == "txt":
        text = content.decode("utf-8")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    # Index document in vector store
    add_document(doc_id=filename, text=text)
    return {"filename": filename, "text": text[:500]}

class LinkRequest(BaseModel):
    url: str

@app.post("/process-link/")
async def process_link(request: LinkRequest):
    url = request.url
    try:
        text = web_utils.extract_text_from_url(url)
        add_document(doc_id=url, text=text)
        return {"url": url, "text": text[:500]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class ChatRequest(BaseModel):
    message: str

@app.post("/chat/")
async def chat(request: ChatRequest):

    # Save user message in vector DB
    from app.rag_pipeline import save_chat_message
    import uuid
    message_id = f"chat_{uuid.uuid4()}"
    save_chat_message(request.message, message_id)
    # Generate answer with OpenAI
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": request.message}]
        )
        answer = response.choices[0].message.content
        print(f"[OpenAI answer]: {answer}")
    except Exception as e:
        answer = f"Error: {str(e)}"
        print(f"[OpenAI error]: {str(e)}")
    return {"answer": answer}

# Endpoint separat pentru get_summary_by_title
class SummaryRequest(BaseModel):
    title: str

@app.post("/get-summary/")
async def get_summary(request: SummaryRequest):
    summary = get_summary_by_title(request.title)
    return {"title": request.title, "summary": summary}

# Endpoint pentru generare imagine carte (DALL-E)
class ImageRequest(BaseModel):
    title: str
    summary: str = ""

@app.post("/generate-image/")
async def generate_image(request: ImageRequest):
    prompt = f"Book cover or a representative scene for the book '{request.title}'. {request.summary}"
    try:
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size="512x512"
        )
        image_url = response.data[0].url
        return {"image_url": image_url}
    except Exception as e:
        return {"error": str(e)}

# Endpoint to list all books in ChromaDB
@app.get("/list-books/")
def list_books():
    try:
        from app.rag_pipeline import collection
        docs = collection.get()
        titles = docs.get('ids', [])
        # Filtrează doar titlurile care nu sunt id-uri user
        filtered_titles = [t for t in titles if not (isinstance(t, str) and t.startswith('user_'))]
        return {"books": filtered_titles}
    except Exception as e:
        return {"error": str(e)}

# Endpoint pentru raport costuri OpenAI
@app.get("/cost-report/")
def cost_report():
    logs = []
    try:
        with open("openai_cost_log.json", "r") as f:
            for line in f:
                try:
                    logs.append(json.loads(line))
                except Exception:
                    pass
    except FileNotFoundError:
        pass
    return JSONResponse(content=logs)



from app.rag_pipeline import chat_collection

@app.get("/list-chat-messages/")
def list_chat_messages():
    try:
        docs = chat_collection.get()
        messages = docs.get('documents', [])
        ids = docs.get('ids', [])
        return {"messages": messages, "ids": ids}
    except Exception as e:
        return {"error": str(e)}

