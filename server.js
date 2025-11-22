// Simple local server for testing
require('dotenv').config();
const express = require('express');
const path = require('path');
const submitHandler = require('./api/submit');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// API endpoints
app.post('/api/submit', submitHandler);
app.post('/api/ab-test', require('./api/ab-test'));
app.get('/api/analytics', require('./api/analytics'));
app.get('/api/export', require('./api/export'));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`\n📝 Open your browser and go to: http://localhost:${PORT}\n`);
});
