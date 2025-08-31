import React, { useState } from 'react';
import { Select, MenuItem, Box, Typography } from '@mui/material';
import ChatWithActions from './components/ChatWithActions';
import ThemeVoiceMenu from './components/ThemeVoiceMenu';
import SlideSidebar from './components/SlideSidebar';
import DocumentHistorySidebar from './components/DocumentHistorySidebar';

import { ThemeProvider, createTheme } from '@mui/material/styles';

function App() {
  // Șterge chat din istoric
  const handleDeleteChat = (idx) => {
    setChatHistory(prev => prev.filter((_, i) => i !== idx));
    if (activeChatIdx === idx) setActiveChatIdx(null);
    else if (activeChatIdx > idx) setActiveChatIdx(activeChatIdx - 1);
  };

  // Redenumește chat: salvează titlul separat, nu modifică mesajul user
  const handleRenameChat = (idx, newName) => {
    setChatHistory(prev => prev.map((chat, i) => {
      if (i !== idx) return chat;
      // Adaugă/actualizează titlul pe chat ca proprietate specială
      const newChat = [...chat];
      newChat.title = newName;
      return newChat;
    }));
  };
  const [chatHistory, setChatHistory] = useState([]);
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem('userAvatar') || '');
  // Persistență chat-uri în localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setChatHistory(parsed);
        else setChatHistory([]);
      }
    } catch {
      setChatHistory([]);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  React.useEffect(() => {
    if (userAvatar) localStorage.setItem('userAvatar', userAvatar);
  }, [userAvatar]);
  const [theme, setTheme] = useState('light');
  const [activeChatIdx, setActiveChatIdx] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');

  // Definire teme de culori
  const themeColors = {
    light: { bg: '#f5f7fa', chatBg: '#fff', sidebarBg: '#e3f2fd', text: '#222' },
    dark: { bg: '#222', chatBg: '#333', sidebarBg: '#263238', text: '#fff' },
    blue: { bg: '#e3f2fd', chatBg: '#bbdefb', sidebarBg: '#90caf9', text: '#0d47a1' },
    green: { bg: '#e8f5e9', chatBg: '#c8e6c9', sidebarBg: '#a5d6a7', text: '#1b5e20' },
    purple: { bg: '#f3e5f5', chatBg: '#ce93d8', sidebarBg: '#ba68c8', text: '#4a148c' },
    orange: { bg: '#fff3e0', chatBg: '#ffcc80', sidebarBg: '#ffb74d', text: '#e65100' },
    pink: { bg: '#fce4ec', chatBg: '#f8bbd0', sidebarBg: '#f06292', text: '#ad1457' }
  };
  const colors = themeColors[theme];

  // Adaugă mesaj la chatul activ sau creează unul nou doar la prima interacțiune
  const handleNewMessage = (msg) => {
    setChatHistory(prev => {
      let newHistory;
      // Dacă nu există chat activ, creează unul nou cu toate mesajele (array sau single)
      if (activeChatIdx === null || prev.length === 0 || !prev[activeChatIdx]) {
        if (Array.isArray(msg)) {
          newHistory = prev.length === 0 ? [msg] : [...prev, msg];
        } else {
          newHistory = prev.length === 0 ? [[msg]] : [...prev, [msg]];
        }
        return newHistory;
      } else {
        newHistory = prev.map((chat, idx) => {
          if (idx === activeChatIdx) {
            // Creează o copie nouă a chatului activ cu mesajul adăugat
            return [...chat, msg];
          }
          return chat;
        });
        return newHistory;
      }
    });
  };

  // Efect pentru a seta indexul activ corect după adăugarea primului mesaj
  React.useEffect(() => {
    if (chatHistory.length > 0 && (activeChatIdx === null || activeChatIdx >= chatHistory.length)) {
      setActiveChatIdx(chatHistory.length - 1);
    }
  }, [chatHistory]);

  // Selectarea unui chat din sidebar
  const handleSelectChat = (idx) => {
    setActiveChatIdx(idx);
  };

  // Creează chat nou doar la apăsarea "New Chat"
  const handleNewChat = () => {
    setChatHistory(prev => {
      const newHistory = [...prev, []];
      setActiveChatIdx(newHistory.length - 1);
      return newHistory;
    });
  };

  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: { main: colors.text },
      background: { default: colors.bg },
      text: { primary: colors.text },
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <div style={{ background: colors.bg, minHeight: '100vh', width: '100vw', display: 'flex' }}>
        <SlideSidebar
          chatHistory={chatHistory}
          onSelect={handleSelectChat}
          onNewChat={handleNewChat}
          open={sidebarOpen}
          onOpen={() => setSidebarOpen(true)}
          onClose={() => setSidebarOpen(false)}
          colors={colors}
          activeChatIdx={activeChatIdx}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', minHeight: '100vh', padding: '0 0 32px 0', position: 'relative' }}>
          {/* Icon mic dreapta sus pentru tema și voice */}
          <Box sx={{ position: 'absolute', top: 12, right: 24, zIndex: 10 }}>
            <ThemeVoiceMenu
              theme={theme}
              setTheme={setTheme}
              colors={colors}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
            />
          </Box>
          <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', background: 'transparent', boxShadow: 'none', borderRadius: 0, p: 0 }}>
            <ChatWithActions
              onNewMessage={handleNewMessage}
              theme={theme}
              colors={colors}
              selectedVoice={selectedVoice}
              chat={
                activeChatIdx !== null &&
                Array.isArray(chatHistory) &&
                chatHistory.length > 0 &&
                activeChatIdx >= 0 &&
                activeChatIdx < chatHistory.length &&
                Array.isArray(chatHistory[activeChatIdx])
                  ? chatHistory[activeChatIdx]
                  : []
              }
              userAvatar={userAvatar}
              setUserAvatar={setUserAvatar}
            />
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
