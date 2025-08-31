import chromadb
import numpy as np
import os

# Initialize ChromaDB persistent client (new API)
chroma_client = chromadb.PersistentClient(path="./chromadb_data_test")

# Create the collection
try:
    collection = chroma_client.get_collection(name="test_collection")
except Exception:
    collection = chroma_client.create_collection(name="test_collection")

# Add a document with a random vector
doc = "Test document for ChromaDB"
vector = np.random.rand(1536).tolist()
collection.add(documents=[doc], ids=["test_id"], embeddings=[vector])
print("Document added.")

print("Check the chromadb_data_test folder for files.")
if os.path.exists("./chromadb_data_test") and os.listdir("./chromadb_data_test"):
    print("Data has been saved in chromadb_data_test!")
else:
    print("The chromadb_data_test folder is empty or nothing was created.")
