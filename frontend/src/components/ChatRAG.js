import React, { useState } from 'react';
import axios from 'axios';

function ChatRAG() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnswer('');
    try {
  const res = await axios.post('http://127.0.0.1:8000/chat/', { message: question });
      setAnswer(res.data.answer || 'No answer received.');
    } catch (err) {
  setAnswer('Error: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Chat RAG</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Enter your question..."
          style={{ width: '80%', padding: '0.5rem' }}
          required
        />
        <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
          {loading ? 'Loading...' : 'Ask'}
        </button>
      </form>
      {answer && (
        <div style={{ marginTop: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: 4 }}>
          <strong>Answer:</strong>
          <div>{answer}</div>
        </div>
      )}
    </div>
  );
}

export default ChatRAG;
