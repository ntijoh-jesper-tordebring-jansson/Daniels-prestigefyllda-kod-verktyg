// Load external modules installed thru npm
const express = require('express')
const dotenv = require('dotenv')
const path = require('path');

// Load custom modules
const Api = require('./middleware/api');

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

app.post('/search', async (req, res) => {
    const username = "ntijoh-daniel-berg";

    const api = new Api();


    try {
        const content = await api.getRepository(username); // Väntar på resultatet
        console.log(content); // Logga innehållet
        res.json(content); // Skicka tillbaka innehållet som JSON till klienten
    } catch (error) {
        console.error(error.message); // Logga eventuella fel
        res.status(500).json({ error: error.message }); // Skicka tillbaka felmeddelande
    }


    // async (username) => {
    //     const content = await api.getRepository(username);
    //     console.log(content);   
    // }
})

// Confirm that the server is running
app.listen(PORT, () => {

    // Console log that server is running and on which PORT
    console.log(`Server running on port ${PORT}`);
});