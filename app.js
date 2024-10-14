// Load external modules installed thru npm
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load custom modules
const Api = require('./middleware/api');
const Test = require('./middleware/tests');
const DbController = require('./database/db_controller');

// Configure dotenv (which makes is possible to use .env files)
dotenv.config();

// Specifiy the PORT which the server should run on
const PORT = process.env.NODEJS_RUNTIME_PORT;

// Create the express app
const app = express();

app.use('/src', express.static(path.join(__dirname, 'src')));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

app.post('/search', async (req, res) => {
    const username = req.body.username;

    const api = new Api();

    try {
        const content = await api.getRepository(username); 
        res.json(content);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-forks', async (req, res) => {
    const fullname = req.body.fullname;
    const api = new Api();
    const dbController = new DbController();

    try {
        const forks = await api.getForks(fullname);

        const forksWithContent = await Promise.all(forks.map(async (fork) => {
            const manifest = await api.getManifestFile(fork.full_name.full_name);
            const fileContent = await api.getFileContent(fork.full_name.full_name, manifest.filePath);

            const { comment, status } = await dbController.readFromDb(fork.full_name.full_name) || { comment: null, status: null };

            return {
                "full_name": fork.full_name.full_name,
                "gh_link": fork.full_name.html_url,
                "fileContent": fileContent,
                "testFilePath": manifest.filePath,
                "comment": comment,
                "status": status
            };
        }));

        res.json(forksWithContent);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/run-tests', async (req, res) => {
    const { fullname } = req.body;
    const api = new Api();
    const test = new Test();

    try {
        const repoPath = await test.cloneRepository(fullname);
        const manifest = await api.getManifestFile(fullname);
        const fileContent = await api.getFileContent(fullname, manifest.filePath);

        const testResults = await test.runTests(manifest, fileContent);

        res.json({ testResults });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/submit-review', async (req, res) => {
    const { repoFullname, reviewComment, status } = req.body;
    const dbController = new DbController();

    try {
        const existingData = await dbController.readFromDb(repoFullname);
        
        if (existingData) {
            await dbController.updateInDb(repoFullname, reviewComment, status);
        } else {
            await dbController.insertIntoDb(repoFullname, reviewComment, status);
        }

        res.status(200).json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

// Confirm that the server is running
app.listen(PORT, () => {

    // Console log that server is running and on which PORT
    console.log(`Server running on port ${PORT}`);
});