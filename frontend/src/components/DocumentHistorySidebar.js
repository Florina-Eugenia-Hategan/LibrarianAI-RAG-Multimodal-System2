import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, IconButton, Select, MenuItem, InputLabel, FormControl, TextField } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const periods = [
  { label: 'Day', value: 'day' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

function DocumentHistorySidebar({ theme, setTheme }) {
  const [period, setPeriod] = useState('day');
  const [selected, setSelected] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    // Exemplu fetch, înlocuiește cu endpoint real
  fetch(`http://127.0.0.1:8000/documents/history?period=${period}&value=${filterValue}`)
      .then(res => res.json())
      .then(data => setDocuments(Array.isArray(data) ? data : []))
      .catch(() => setDocuments([]));
  }, [period, filterValue]);

  return (
    <Box sx={{ width: 320, height: '100vh', position: 'fixed', right: 0, top: 0, bgcolor: theme === 'dark' ? '#222' : '#f5f7fa', boxShadow: 3, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <DescriptionIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={700}>Istoric Documente</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel id="period-label"><CalendarMonthIcon sx={{ mr: 1 }} />Period</InputLabel>
        <Select
          labelId="period-label"
          value={period}
          label="Period"
          onChange={e => setPeriod(e.target.value)}
        >
          {periods.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField
        label={`Filter by ${periods.find(p => p.value === period)?.label.toLowerCase()}`}
        value={filterValue}
        onChange={e => setFilterValue(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <List sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {documents.length === 0 ? (
          <Typography align="center" color="textSecondary">No documents found.</Typography>
        ) : (
          documents.map(doc => (
            <ListItem
              key={doc.id}
              button
              selected={selected === doc.id}
              onClick={() => setSelected(doc.id)}
              sx={{ bgcolor: selected === doc.id ? (theme === 'dark' ? '#333' : '#e3f2fd') : 'inherit', borderRadius: 2, mb: 1 }}
            >
              <ListItemText
                primary={doc.name}
                secondary={`Data: ${doc.date} | Tip: ${doc.type}`}
              />
            </ListItem>
          ))
        )}
      </List>
      {selected && (
        <Box sx={{ mt: 2, p: 2, bgcolor: theme === 'dark' ? '#333' : '#e3f2fd', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>Detalii document</Typography>
          <Typography>Nume: {documents.find(d => d.id === selected)?.name}</Typography>
          <Typography>Data: {documents.find(d => d.id === selected)?.date}</Typography>
          <Typography>Tip: {documents.find(d => d.id === selected)?.type}</Typography>
          <Typography>Preview: {documents.find(d => d.id === selected)?.preview || 'N/A'}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default DocumentHistorySidebar;
