
import React, { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import { Drawer, List, ListItem, ListItemText, Typography, IconButton, Box, TextField, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
// SearchIcon eliminat

function SlideSidebar({ chatHistory, onSelect, onNewChat, open, onOpen, onClose, activeChatIdx, onDeleteChat, onRenameChat }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuIdx, setMenuIdx] = useState(null);
  // Eliminat search
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const filteredChats = chatHistory;

  return (
    <>
      <IconButton onClick={onOpen} sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1000 }}>
        <MenuIcon fontSize="large" />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={onClose} variant="persistent" PaperProps={{ sx: { width: 220, bgcolor: '#181818', borderRight: '1px solid #222', boxShadow: 3, zIndex: 1200 } }}>
        <Box sx={{ width: 220, height: '100vh', bgcolor: '#181818', p: 0, display: 'flex', flexDirection: 'column', zIndex: 1200 }}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Button fullWidth variant="contained" color="primary" startIcon={<AddIcon />} sx={{ mb: 2, bgcolor: '#222', color: '#fff', textTransform: 'none', fontWeight: 500, fontSize: 15, borderRadius: 2, boxShadow: 0 }} onClick={onNewChat}>
              New chat
            </Button>
            {/* Search eliminat din sidebar */}
            <Divider sx={{ bgcolor: '#222', mb: 2 }} />
            <Typography variant="caption" sx={{ color: '#aaa', fontWeight: 500, mb: 1, pl: 1 }}>Chats</Typography>
          </Box>
          <List sx={{ flex: 1, overflowY: 'auto', gap: 1, px: 1, py: 0 }}>
            {filteredChats.length === 0 ? (
              <ListItem sx={{ justifyContent: 'center', py: 4 }}>
                <ListItemText primary="No chats yet." sx={{ textAlign: 'center', color: '#aaa' }} />
              </ListItem>
            ) : (
              filteredChats.map((chat, idx) => (
                <ListItem
                  button
                  key={idx}
                  onClick={() => onSelect(idx)}
                  selected={activeChatIdx === idx}
                  sx={{ mb: 1, borderRadius: 2, boxShadow: activeChatIdx === idx ? 2 : 0, bgcolor: activeChatIdx === idx ? '#222' : 'transparent', color: '#fff', minHeight: 44, alignItems: 'center', px: 2 }}
                  onContextMenu={e => { e.preventDefault(); setMenuAnchor(e.currentTarget); setMenuIdx(idx); }}
                >
                  {editIdx === idx ? (
                    <input
                      value={editValue}
                      autoFocus
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => { onRenameChat(idx, editValue); setEditIdx(null); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { onRenameChat(idx, editValue); setEditIdx(null); }
                        if (e.key === 'Escape') setEditIdx(null);
                      }}
                      style={{ width: '90%', fontSize: 15, background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px' }}
                    />
                  ) : (
                    <ListItemText
                      primary={chat.title ? chat.title : (() => {
                        const firstUserMsg = chat.find(m => m.type === 'user');
                        return firstUserMsg ? firstUserMsg.text : 'No title';
                      })()}
                      sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff', fontSize: 15 }}
                      onDoubleClick={() => {
                        setEditIdx(idx);
                        setEditValue(chat.title ? chat.title : (() => { const firstUserMsg = chat.find(m => m.type === 'user'); return firstUserMsg ? firstUserMsg.text : ''; })());
                      }}
                    />
                  )}
                  <IconButton size="small" sx={{ ml: 1 }} onClick={e => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuIdx(idx); }}>
                    <span style={{ fontWeight: 'bold', fontSize: 18 }}>⋮</span>
                  </IconButton>
                </ListItem>
              ))
            )}
          </List>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={() => { setEditIdx(menuIdx); setEditValue((() => { const firstUserMsg = chatHistory[menuIdx]?.find(m => m.type === 'user'); return firstUserMsg ? firstUserMsg.text : ''; })()); setMenuAnchor(null); }}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Rename" />
            </MenuItem>
            <MenuItem onClick={() => { onDeleteChat(menuIdx); setMenuAnchor(null); }}>
              <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </Menu>
        </Box>
      </Drawer>
    </>
  );
}

export default SlideSidebar;
