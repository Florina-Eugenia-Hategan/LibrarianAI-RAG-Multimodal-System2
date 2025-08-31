import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Dummy data for demo; replace with API call to backend
const dummyDocuments = [
  { name: 'report1.pdf', date: '2025-08-20', type: 'pdf' },
  { name: 'contract.docx', date: '2025-08-19', type: 'docx' },
  { name: 'notes.txt', date: '2025-07-15', type: 'txt' },
  { name: 'webpage.html', date: '2025-06-10', type: 'web' },
];

function getUniquePeriods(docs, period) {
  if (period === 'day') return [...new Set(docs.map(d => d.date))];
  if (period === 'month') return [...new Set(docs.map(d => d.date.slice(0,7)))];
  if (period === 'year') return [...new Set(docs.map(d => d.date.slice(0,4)))];
  return [];
}

function DocumentHistoryMenu({ onSelect }) {
  const [period, setPeriod] = useState('day');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [filteredDocs, setFilteredDocs] = useState(dummyDocuments);

  useEffect(() => {
    const periods = getUniquePeriods(dummyDocuments, period);
    setSelectedPeriod(periods[0] || '');
  }, [period]);

  useEffect(() => {
    if (!selectedPeriod) {
      setFilteredDocs(dummyDocuments);
      return;
    }
    if (period === 'day') {
      setFilteredDocs(dummyDocuments.filter(d => d.date === selectedPeriod));
    } else if (period === 'month') {
      setFilteredDocs(dummyDocuments.filter(d => d.date.startsWith(selectedPeriod)));
    } else if (period === 'year') {
      setFilteredDocs(dummyDocuments.filter(d => d.date.startsWith(selectedPeriod)));
    }
  }, [selectedPeriod, period]);

  return (
    <Box sx={{ width: 300, position: 'fixed', right: 0, top: 0, height: '100vh', background: '#222', color: '#fff', p: 2, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}><FolderIcon sx={{ mr: 1 }} />Document History</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: '#fff' }}>Period</InputLabel>
        <Select value={period} onChange={e => setPeriod(e.target.value)} sx={{ color: '#fff', borderColor: '#fff' }}>
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: '#fff' }}>Select {period}</InputLabel>
        <Select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} sx={{ color: '#fff', borderColor: '#fff' }}>
          {getUniquePeriods(dummyDocuments, period).map(p => (
            <MenuItem key={p} value={p}>{p}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ mb: 2, bgcolor: '#444' }} />
      <List>
        {filteredDocs.length === 0 ? (
          <ListItem>
            <ListItemText primary="No documents found." />
          </ListItem>
        ) : (
          filteredDocs.map((doc, idx) => (
            <ListItem button key={idx} onClick={() => onSelect && onSelect(doc)}>
              <CalendarTodayIcon sx={{ mr: 1 }} />
              <ListItemText primary={doc.name} secondary={doc.date} />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}

export default DocumentHistoryMenu;
