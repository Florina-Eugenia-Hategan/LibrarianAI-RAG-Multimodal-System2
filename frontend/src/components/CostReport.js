import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

function CostReport() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
  fetch('http://127.0.0.1:8000/cost-report/')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(() => setLogs([]));
  }, []);

  const safeLogs = Array.isArray(logs) ? logs : [];
  return (
    <Box sx={{ maxWidth: 600, margin: '2rem auto' }}>
      <Typography variant="h6">OpenAI Cost Report</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        {safeLogs.length === 0 ? (
          <Typography>No cost data available.</Typography>
        ) : (
          safeLogs.map((log, idx) => (
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
  );
}

export default CostReport;
