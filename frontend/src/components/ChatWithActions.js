  // Avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUserAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };
import React, { useState, useRef } from 'react';
import { Select, MenuItem } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import axios from 'axios';
import { Box, Typography, IconButton, TextField, Paper, LinearProgress, Tooltip, InputAdornment, Avatar } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';

function ChatWithActions({ onNewMessage, theme = 'light', colors, selectedVoice, chat = [], userAvatar, setUserAvatar }) {
  // Vosk audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [recordError, setRecordError] = useState('');

  // Start recording
  const handleStartRecording = async () => {
    setRecordError('');
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setRecordError('Audio recording not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      let chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      setRecorder(mediaRecorder);
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setRecordError('Microphone access denied or error: ' + err.message);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  // Upload audio to backend
  const handleUploadAudio = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setRecordError('');
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
  const res = await axios.post('http://127.0.0.1:8000/transcribe-audio/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.transcript) {
        setInput(res.data.transcript);
      } else {
        setRecordError('No transcript received.');
      }
    } catch (err) {
      setRecordError('Error uploading audio: ' + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };
  // Typing animation state
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  // Edit last message with arrow up
  const inputRef = useRef();
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && chat.length > 0 && input === '') {
        const lastUserMsg = [...chat].reverse().find(m => m.type === 'user');
        if (lastUserMsg) setInput(lastUserMsg.text);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chat, input]);
  // TTS voices
  // Eliminat voice selector, primește selectedVoice din App
  // Text-to-Speech handler cu control manual
  const ttsRef = useRef(null);
    const [ttsActive, setTtsActive] = useState(false);
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      if (selectedVoice) {
        const voices = window.speechSynthesis.getVoices();
        const voiceObj = voices.find(v => v.name === selectedVoice);
        if (voiceObj) utter.voice = voiceObj;
      }
      utter.onend = () => setTtsActive(false);
      utter.onerror = () => {
        setTtsActive(false);
        alert('Audio playback error!');
      };
      ttsRef.current = utter;
      window.speechSynthesis.speak(utter);
      setTtsActive(true);
    } else {
      alert('Text-to-Speech is not supported in this browser!');
    }
  };
  const handleStopSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTtsActive(false);
    }
  };

  // Speech-to-Text
  const recognitionRef = useRef(null);
    const [sttActive, setSttActive] = useState(false);
    const [sttError, setSttError] = useState('');
  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setSttError('Speech-to-Text is not supported in this browser!');
      setTimeout(() => setSttError(''), 3000);
      return;
    }
    if (!recognitionRef.current) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setSttActive(false);
      };
      recognitionRef.current.onerror = (event) => {
        setSttError('Speech recognition error: ' + event.error);
        setSttActive(false);
        setTimeout(() => setSttError(''), 3000);
      };
    }
    recognitionRef.current.start();
    setSttActive(true);
  };
  // eliminat redeclararea input
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setIsTyping(true);
    setRecordError(''); // Ascunde mesajul de microfon la trimitere
    try {
      const res = await axios.post('http://127.0.0.1:8000/chat/', { message: input });
      let imageUrl = '';
      if (res.data.recommended_title && res.data.summary) {
        try {
          const imgRes = await axios.post('http://127.0.0.1:8000/generate-image/', {
            title: res.data.recommended_title,
            summary: res.data.summary
          });
          imageUrl = imgRes.data.image_url || '';
        } catch (imgErr) {
          imageUrl = '';
        }
      }
      const botMsg = {
        type: 'bot',
        title: res.data.recommended_title || '',
        answer: res.data.answer || 'No answer received.',
        summary: res.data.summary || '',
        context: res.data.context || '',
        results: res.data.results || {},
        image: imageUrl
      };
      // Dacă chat-ul e gol, trimite ambele mesaje împreună ca array
      if (!chat || chat.length === 0) {
        onNewMessage([{ type: 'user', text: input }, botMsg]);
        setIsTyping(false);
      } else {
        onNewMessage({ type: 'user', text: input });
        setTimeout(() => {
          onNewMessage(botMsg);
          setIsTyping(false);
        }, 800);
      }
    } catch (err) {
      let errorMsg = 'Unknown error.';
      if (err.message === 'Network Error') {
        errorMsg = 'Network Error: Backend is not reachable. Please check if the server is running at http://127.0.0.1:8000.';
      } else if (err.response?.data?.detail) {
        errorMsg = 'Error: ' + err.response.data.detail;
      } else if (err.message) {
        errorMsg = 'Error: ' + err.message;
      }
      const errorMsgObj = { type: 'bot', answer: errorMsg };
      setTimeout(() => {
        onNewMessage(errorMsgObj);
        setIsTyping(false);
      }, 800);
    }
    setInput('');
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setLoading(true);
    setChat([...chat, { type: 'user', text: `Uploaded file: ${selectedFile.name}` }]);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
  const res = await axios.post('http://127.0.0.1:8000/upload-file/', formData);
      setChat(prev => [...prev, { type: 'bot', text: 'File uploaded! Preview: ' + (res.data.text || 'No preview') }]);
    } catch (err) {
      let errorMsg = 'Unknown error.';
      if (err.message === 'Network Error') {
  errorMsg = 'Network Error: Backend is not reachable. Please check if the server is running at http://127.0.0.1:8000.';
      } else if (err.response?.data?.detail) {
        errorMsg = 'Error: ' + err.response.data.detail;
      } else if (err.message) {
        errorMsg = 'Error: ' + err.message;
      }
      setChat(prev => [...prev, { type: 'bot', text: errorMsg }]);
    }
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
      let errorMsg = 'Unknown error.';
      if (err.message === 'Network Error') {
  errorMsg = 'Network Error: Backend is not reachable. Please check if the server is running at http://127.0.0.1:8000.';
      } else if (err.response?.data?.detail) {
        errorMsg = 'Error: ' + err.response.data.detail;
      } else if (err.message) {
        errorMsg = 'Error: ' + err.message;
      }
      setChat(prev => [...prev, { type: 'bot', text: errorMsg }]);
    }
    setUrl('');
    setLoading(false);
  };

  return (
  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Chat history and bot/user messages */}
      <Box sx={{ minHeight: 350, maxHeight: '60vh', overflowY: 'auto', mb: 2, px: 0, py: 2, background: 'transparent', borderRadius: 0, boxShadow: 'none', fontFamily: 'Segoe UI, Arial, sans-serif', width: '100%', zIndex: 1 }}>
        {chat.length === 0 ? (
          <Typography align="center" color="textSecondary">Start a conversation!</Typography>
        ) : (
          chat.map((msg, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Avatar alt={msg.type === 'user' ? 'User' : 'Robot'} src={msg.type === 'user' ? userAvatar || undefined : 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png'} sx={{ bgcolor: msg.type === 'user' ? '#1976d2' : '#1976d2', width: 36, height: 36 }} />
              <Box sx={{ p: 2, background: colors ? colors.chatBg : '#fff', borderRadius: 2, boxShadow: 'none', maxWidth: 480, fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: 16, mb: 1, display: 'inline-block' }}>
                {msg.title && (!msg.title.startsWith('user_')) && <Typography variant="subtitle2" color="primary">{msg.title}</Typography>}
                <Typography variant="body1" color="textPrimary">{msg.text || msg.answer || msg.summary || msg.context || ''}</Typography>
                {msg.summary &&
                  msg.summary !== 'Rezumat indisponibil.' &&
                  msg.summary !== 'No matching book found. Please ask about a different book or topic.' &&
                  !msg.summary.includes('Fișierul de rezumate nu există') &&
                  !msg.summary.includes('Nu există rezumat pentru titlul') && (
                    <Typography variant="caption" color="textSecondary">
                      <strong>Summary:</strong> {msg.summary}
                    </Typography>
                )}
                {msg.context && (
                  <Typography variant="caption" color="textSecondary">
                    <strong>Context:</strong> {msg.context}
                  </Typography>
                )}
                {msg.image && (
                  <Box sx={{ mt: 1 }}>
                    <img src={msg.image} alt="Generated" style={{ maxWidth: 200, borderRadius: 8 }} />
                  </Box>
                )}
              </Box>
            </Box>
          ))
        )}
        {isTyping && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Avatar alt="Robot" src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" sx={{ bgcolor: '#1976d2', width: 36, height: 36 }} />
            <Box sx={{ p: 2, background: colors ? colors.chatBg : '#fff', borderRadius: 2, boxShadow: 'none', maxWidth: 480, fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: 16, mb: 1, display: 'inline-block' }}>
              <Typography variant="body1" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                Typing...
              </Typography>
            </Box>
          </Box>
        )}
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </Box>
      {/* Chat input and actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, position: 'static', width: '100%', maxWidth: 700, mx: 'auto', zIndex: 2, background: 'transparent', borderRadius: 0, boxShadow: 'none', p: 0 }}>
        <TextField
          label="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          fullWidth
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Send">
                  {loading || !input.trim() ? (
                    <span>
                      <IconButton color="primary" onClick={handleSend} disabled={loading || !input.trim()}>
                        <SendIcon />
                      </IconButton>
                    </span>
                  ) : (
                    <IconButton color="primary" onClick={handleSend}>
                      <SendIcon />
                    </IconButton>
                  )}
                </Tooltip>
                <Tooltip title="Upload file">
                  {loading ? (
                    <span>
                      <IconButton color="primary" component="label" disabled={loading}>
                        <AttachFileIcon />
                        <input type="file" hidden onChange={handleFileUpload} />
                      </IconButton>
                    </span>
                  ) : (
                    <IconButton color="primary" component="label">
                      <AttachFileIcon />
                      <input type="file" hidden onChange={handleFileUpload} />
                    </IconButton>
                  )}
                </Tooltip>
                {/* Vosk microphone only */}
                <Tooltip title={isRecording ? 'Stop recording' : 'Start recording'}>
                  {loading ? (
                    <span>
                      <IconButton color={isRecording ? 'secondary' : 'primary'} onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={loading}>
                        {isRecording ? <span style={{fontWeight:'bold',fontSize:18}}>⏹</span> : <MicIcon />}
                      </IconButton>
                    </span>
                  ) : (
                    <IconButton color={isRecording ? 'secondary' : 'primary'} onClick={isRecording ? handleStopRecording : handleStartRecording}>
                      {isRecording ? <span style={{fontWeight:'bold',fontSize:18}}>⏹</span> : <MicIcon />}
                    </IconButton>
                  )}
                </Tooltip>
                <Tooltip title="Upload and transcribe audio">
                  {!audioBlob || loading ? (
                    <span>
                      <IconButton color="primary" onClick={handleUploadAudio} disabled={!audioBlob || loading}>
                        <span style={{fontWeight:'bold',fontSize:18}}>⬆️</span>
                      </IconButton>
                    </span>
                  ) : (
                    <IconButton color="primary" onClick={handleUploadAudio}>
                      <span style={{fontWeight:'bold',fontSize:18}}>⬆️</span>
                    </IconButton>
                  )}
                </Tooltip>
                {audioBlob && <Typography variant="caption" color="primary">Audio ready for upload</Typography>}
                {recordError && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, mb: 2 }}>
                    <MicIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="body1" color="error" sx={{ fontWeight: 600 }}>
                      Microphone access denied.<br />
                      <span style={{ fontSize: 14, color: '#b71c1c', fontWeight: 400 }}>
                        Please allow microphone access in your browser and system settings.<br />
                        <span style={{ fontSize: 12, color: '#b71c1c' }}>
                          (Click the lock icon near the URL and set Microphone to Allow)
                        </span>
                      </span>
                    </Typography>
                  </Box>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
export default ChatWithActions;
