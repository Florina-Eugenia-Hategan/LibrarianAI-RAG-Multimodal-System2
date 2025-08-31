import React from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Avatar, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function ChatHistorySidebar({ chatHistory, onSelect, open, style }) {
  return (
    <Drawer anchor="left" open={open} variant="persistent" sx={{ width: 280 }}>
      <div style={{ width: 280, padding: '1rem', ...style }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Chat History
        </Typography>
        <List>
          {chatHistory.length === 0 ? (
            <ListItem>
              <ListItemText primary="No chats yet." />
            </ListItem>
          ) : (
            chatHistory.map((item, idx) => (
              <ListItem button key={idx} onClick={() => onSelect(idx)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.type === 'user' ? (
                    <Avatar sx={{ bgcolor: '#90caf9', width: 28, height: 28 }}>
                      <PersonIcon />
                    </Avatar>
                  ) : (
                    <Avatar alt="Robot" src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" sx={{ bgcolor: '#1976d2', width: 28, height: 28 }} />
                  )}
                  <ListItemText
                    primary={item.type === 'user' ? item.text : item.title ? item.title : 'Bot'}
                    secondary={item.answer ? item.answer.slice(0, 40) + '...' : ''}
                  />
                </Box>
              </ListItem>
            ))
          )}
        </List>
      </div>
    </Drawer>
  );
}

export default ChatHistorySidebar;
