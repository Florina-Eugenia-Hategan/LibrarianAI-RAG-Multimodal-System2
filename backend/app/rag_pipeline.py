import json
from datetime import datetime
 
import os
import openai
import chromadb

from chromadb.config import Settings


from dotenv import load_dotenv
from typing import List
import numpy as np
from rich import print
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
if OPENAI_API_KEY:
    print("[INFO] OpenAI API key loaded successfully.")
else:
    print("[ERROR] OpenAI API key not found! Check your .env file.")

# Cost monitoring
costs = {
    "embeddings": 0.0,
    "completions": 0.0,
    "embeddings_tokens": 0,
    "completions_tokens": 0
}
EMBEDDINGS_PRICE_PER_1K = 0.0001  # $0.0001 per 1K tokens (ada-002)
COMPLETIONS_PRICE_PER_1K = 0.001  # $0.001 per 1K tokens (gpt-3.5-turbo)
 

chroma_client = chromadb.Client(Settings(
    persist_directory="c:/Users/flhategan/OneDrive - ENDAVA/Desktop/Project_RAG/backend/chromadb_data"
))

chroma_client = chromadb.PersistentClient(path="./chromadb_data")

try:
    collection = chroma_client.get_collection(name="rag_docs")
except Exception:
    collection = chroma_client.create_collection(name="rag_docs")



# Chat history collection
try:
    chat_collection = chroma_client.get_collection(name="chat_history")
except Exception:
    chat_collection = chroma_client.create_collection(name="chat_history")

def save_chat_message(message: str, message_id: str):
    embedding = embed_text(message)
    chat_collection.add(documents=[message], ids=[message_id], embeddings=[embedding])
    print(f"Saved chat message: {message}")


def embed_text(text: str) -> np.ndarray:
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    tokens = getattr(response, 'usage', None)
    if tokens:
        tokens = response.usage.total_tokens
    else:
        tokens = 0
    costs["embeddings_tokens"] += tokens
    cost = (tokens / 1000) * EMBEDDINGS_PRICE_PER_1K
    costs["embeddings"] += cost
    print(f"[COST] Embeddings: {tokens} tokens, ${costs['embeddings']:.6f} total")
    log_entry = {
        "type": "embeddings",
        "datetime": datetime.now().isoformat(),
        "tokens": tokens,
        "cost": cost
    }
    with open("openai_cost_log.json", "a") as f:
        f.write(json.dumps(log_entry) + "\n")
    return np.array(response.data[0].embedding)

def add_document(text: str, doc_id: str):
    embedding = embed_text(text)
    collection.add(documents=[text], ids=[doc_id], embeddings=[embedding])

    chroma_client.persist()  # Ensure vectors are saved to disk

    collection.persist()  # Ensure vectors are saved to disk


def search_similar(query: str, top_k: int = 3) -> List[str]:
    query_emb = embed_text(query)
    results = collection.query(query_embeddings=[query_emb], n_results=top_k)
    return results

    # ...existing code...
def generate_answer(context: List[str], question: str) -> str:
    prompt = f"Context: {' '.join(context)}\nQuestion: {question}\nAnswer:"
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "You are a helpful assistant."},
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()

# Tool: get_summary_by_title
def get_summary_by_title(title: str) -> str:
    """
    Returnează rezumatul complet pentru titlul exact din book_summaries.json
    """
    try:
        with open("backend/book_summaries.json", "r", encoding="utf-8") as f:
            summaries = json.load(f)
        if title in summaries:
            return summaries[title]
        else:
            return f"Nu există rezumat pentru titlul: {title}."
    except FileNotFoundError:
        return "Fișierul de rezumate nu există. Adaugă backend/book_summaries.json."
    except Exception as e:
        return f"Eroare la accesarea rezumatului: {e}"
