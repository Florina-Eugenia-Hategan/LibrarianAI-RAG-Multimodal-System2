import React, { useState, useEffect } from 'react';
import { IconButton, Menu, MenuItem, Typography, Select, Box } from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

function ThemeVoiceMenu({ theme, setTheme, colors, selectedVoice, setSelectedVoice }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const vs = window.speechSynthesis.getVoices();
        setVoices(vs);
        if (vs.length && !selectedVoice) setSelectedVoice(vs[0].name);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    // eslint-disable-next-line
  }, []);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleMenuOpen} sx={{ background: colors.sidebarBg, color: colors.text, width: 36, height: 36 }}>
        <ColorLensIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ mt: 1 }}>
        <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Theme</Typography>
          <Select value={theme} onChange={e => { setTheme(e.target.value); }} size="small" fullWidth sx={{ mb: 2 }}>
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="blue">Blue</MenuItem>
            <MenuItem value="green">Green</MenuItem>
            <MenuItem value="purple">Purple</MenuItem>
            <MenuItem value="orange">Orange</MenuItem>
            <MenuItem value="pink">Pink</MenuItem>
          </Select>
          <Typography variant="body2" sx={{ mb: 1 }}>Voice</Typography>
          <Select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} size="small" fullWidth>
            {voices.map(v => (
              <MenuItem key={v.name} value={v.name}>{v.name}</MenuItem>
            ))}
          </Select>
        </Box>
      </Menu>
    </>
  );
}

export default ThemeVoiceMenu;