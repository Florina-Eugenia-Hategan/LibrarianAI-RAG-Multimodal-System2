import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, TextField, Paper, LinearProgress } from '@mui/material';

function UnifiedChat() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [costLogs, setCostLogs] = useState([]);

  useEffect(() => {
  fetch('http://127.0.0.1:8000/cost-report/')
      .then(res => res.json())
      .then(data => setCostLogs(Array.isArray(data) ? data : []))
      .catch(() => setCostLogs([]));
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setChat(prev => [...prev, { type: 'user', text: input }]);
    try {
      const res = await axios.post('http://127.0.0.1:8000/chat/', { message: input });
      console.log('Bot answer:', res.data.answer);
      setChat(prev => [...prev, { type: 'bot', text: res.data.answer || 'No answer received.' }]);
    } catch (err) {
      setChat(prev => [...prev, { type: 'bot', text: 'Error: ' + (err.response?.data?.detail || err.message) }]);
    }
    setInput('');
    setLoading(false);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);
    setChat([...chat, { type: 'user', text: `Uploaded file: ${file.name}` }]);
    const formData = new FormData();
    formData.append('file', file);
    try {
  const res = await axios.post('http://127.0.0.1:8000/upload-file/', formData);
      setChat(prev => [...prev, { type: 'bot', text: 'File uploaded! Preview: ' + (res.data.text || 'No preview') }]);
    } catch (err) {
      setChat(prev => [...prev, { type: 'bot', text: 'Error: ' + (err.response?.data?.detail || err.message) }]);
    }
    setFile(null);
    setLoading(false);
  };

  const handleProcessLink = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setChat([...chat, { type: 'user', text: `Processed link: ${url}` }]);
    try {
  const res = await axios.post('http://127.0.0.1:8000/process-link/', { url });
      setChat(prev => [...prev, { type: 'bot', text: 'Link processed! Preview: ' + (res.data.text || 'No preview') }]);
    } catch (err) {
      setChat(prev => [...prev, { type: 'bot', text: 'Error: ' + (err.response?.data?.detail || err.message) }]);
    }
    setUrl('');
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 700, margin: '2rem auto', p: 3, background: '#fff', borderRadius: 4, boxShadow: 2 }}>
      <Typography variant="h4" align="center" color="primary" fontWeight={700} gutterBottom>
        Multifunctional RAG Chat
      </Typography>
      <Typography align="center" sx={{ mb: 3 }}>
        Salut! Sunt asistentul tău RAG. Poți trimite întrebări, încărca fișiere sau procesa linkuri. Costurile OpenAI sunt afișate mai jos. Totul într-un singur chat interactiv!
      </Typography>
      <Paper sx={{ minHeight: 250, maxHeight: 350, overflowY: 'auto', mb: 2, p: 2 }}>
        {chat.length === 0 ? (
          <Typography align="center" color="textSecondary">Începe o conversație!</Typography>
        ) : (
          chat.map((msg, idx) => (
            <Box key={idx} sx={{ mb: 2, textAlign: msg.type === 'user' ? 'right' : 'left' }}>
              <Typography variant="body1" color={msg.type === 'user' ? 'primary' : 'secondary'}>
                {msg.type === 'user' ? 'Tu: ' : 'RAG: '}{msg.text}
              </Typography>
            </Box>
          ))
        )}
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Scrie o întrebare..."
          value={input}
          onChange={e => setInput(e.target.value)}
          fullWidth
          disabled={loading}
        />
        <Button variant="contained" color="primary" onClick={handleSend} disabled={loading || !input.trim()}>
          Trimite
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outlined" component="span" disabled={loading}>
            Încarcă fișier
          </Button>
        </label>
        <Button variant="contained" color="success" onClick={handleFileUpload} disabled={loading || !file}>
          Trimite fișier
        </Button>
        {file && <Typography sx={{ alignSelf: 'center' }}>{file.name}</Typography>}
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Procesează link web..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          fullWidth
          disabled={loading}
        />
        <Button variant="contained" color="secondary" onClick={handleProcessLink} disabled={loading || !url.trim()}>
          Procesează
        </Button>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" color="primary">OpenAI Cost Report</Typography>
        <Paper sx={{ p: 2, mt: 2 }}>
          {costLogs.length === 0 ? (
            <Typography>No cost data available.</Typography>
          ) : (
            costLogs.map((log, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Typography variant="body2">{log.datetime}</Typography>
                <Typography variant="body2">Type: {log.type}</Typography>
                <Typography variant="body2">Tokens: {log.tokens}</Typography>
                <Typography variant="body2">Cost: ${log.cost.toFixed(6)}</Typography>
              </Box>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default UnifiedChat;
