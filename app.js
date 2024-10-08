// Load external modules installed thru npm
const express = require('express')
const dotenv = require('dotenv')
const path = require('path');

// Configure dotenv (which makes is possible to use .env files)
dotenv.config();

// Specifiy the PORT which the server should run on
const PORT = process.env.NODEJS_RUNTIME_PORT;

// Create the express app
const app = express()

app.use('/src', express.static(path.join(__dirname, 'src')));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

// Confirm that the server is running
app.listen(PORT, () => {

    // Console log that server is running and on which PORT
    console.log(`Server running on port ${PORT}`);
});