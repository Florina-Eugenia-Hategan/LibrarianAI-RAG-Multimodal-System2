import json
import chromadb
from chromadb.config import Settings
import openai
import os
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Initialize ChromaDB with disk persistence
chroma_client = chromadb.Client(Settings(
    persist_directory="./chromadb_data",
    chroma_db_impl="duckdb+parquet"
))

# Create or get the collection
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

# Load book summaries
with open("book_summaries.json", "r", encoding="utf-8") as f:
    summaries = json.load(f)

for title, summary in summaries.items():
    embedding = embed_text(summary)
    collection.add(documents=[summary], ids=[title], embeddings=[embedding])
    print(f"Added: {title}")

print("All book summaries loaded and persisted into ChromaDB.")
