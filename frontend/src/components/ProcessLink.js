import React, { useState } from 'react';
import axios from 'axios';
import { Button, Box, Typography, TextField, LinearProgress } from '@mui/material';

function ProcessLink() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!url) return;
    setLoading(true);
    setResult('');
    try {
  const res = await axios.post('http://127.0.0.1:8000/process-link/', { url });
      setResult('Link processed! Preview: ' + (res.data.text || 'No preview'));
    } catch (err) {
      setResult('Error: ' + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '2rem auto', p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6">Process Web Link</Typography>
      <TextField label="URL" value={url} onChange={e => setUrl(e.target.value)} fullWidth sx={{ my: 2 }} />
      <Button variant="contained" color="secondary" onClick={handleProcess} disabled={loading || !url}>
        {loading ? 'Processing...' : 'Process Link'}
      </Button>
      {loading && <LinearProgress sx={{ mt: 2 }} />}
      {result && <Typography sx={{ mt: 2 }}>{result}</Typography>}
    </Box>
  );
}

export default ProcessLink;
