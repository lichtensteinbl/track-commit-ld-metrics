const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2000;

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// ...existing routes or middleware...

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
