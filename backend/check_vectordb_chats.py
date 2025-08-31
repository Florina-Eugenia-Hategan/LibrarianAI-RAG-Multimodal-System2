from app.rag_pipeline import chat_collection

def print_chat_messages():
    docs = chat_collection.get()
    messages = docs.get('documents', [])
    ids = docs.get('ids', [])
    print("Chat messages saved in vector DB:")
    for msg_id, msg in zip(ids, messages):
        print(f"{msg_id}: {msg}")

if __name__ == "__main__":
    print_chat_messages()
