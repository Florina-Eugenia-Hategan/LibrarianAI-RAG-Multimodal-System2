
import json
import os
from dotenv import load_dotenv
import openai
import chromadb
from chromadb.config import Settings
from app.rag_pipeline import add_document

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Inițializează ChromaDB
chroma_client = chromadb.Client(Settings(
    persist_directory="./chromadb_data"
))
try:
    collection = chroma_client.get_collection(name="rag_docs")
except Exception:
    collection = chroma_client.create_collection(name="rag_docs")

def embed_text(text: str):
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

# Încarcă rezumatele
with open("book_summaries.json", "r", encoding="utf-8") as f:
    summaries = json.load(f)

for title, summary in summaries.items():
    # Adaugă documentul în pipeline (dacă e necesar)
    add_document(summary, doc_id=title)
    # Generează embedding și adaugă în ChromaDB
    embedding = embed_text(summary)
    collection.add(documents=[summary], ids=[title], embeddings=[embedding])
    print(f"Added: {title}")

collection.persist()
print("All book summaries loaded and persisted into ChromaDB.")

