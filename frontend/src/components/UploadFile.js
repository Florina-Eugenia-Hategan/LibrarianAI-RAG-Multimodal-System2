import React, { useState } from 'react';
import axios from 'axios';
import { Button, Box, Typography, LinearProgress } from '@mui/material';

function UploadFile() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setResult('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult('');
    const formData = new FormData();
    formData.append('file', file);
    try {
  const res = await axios.post('http://127.0.0.1:8000/upload-file/', formData);
      setResult('File uploaded! Preview: ' + (res.data.text || 'No preview'));
    } catch (err) {
      setResult('Error: ' + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '2rem auto', p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6">Upload Document</Typography>
      <input type="file" onChange={handleChange} style={{ margin: '1rem 0' }} />
      <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading || !file}>
        {loading ? 'Uploading...' : 'Upload'}
      </Button>
      {loading && <LinearProgress sx={{ mt: 2 }} />}
      {result && <Typography sx={{ mt: 2 }}>{result}</Typography>}
    </Box>
  );
}

export default UploadFile;
