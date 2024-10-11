// Load external modules installed thru npm
const express = require('express')
const dotenv = require('dotenv')
const path = require('path');
const simpleGit = require('simple-git');
const fs = require('fs');

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

    try {
        const forks = await api.getForks(fullname);

        const forksWithContent = await Promise.all(forks.map(async (fork) => {

            const manifest = await api.getManifestFile(fullname);
            const fileContent = await api.getFileContent(fullname, manifest.filePath);

            return {
                "full_name" : fork.full_name.full_name,
                "gh_link" : fork.full_name.html_url,
                "fileContent" : fileContent
            };
        }));

        res.json(forksWithContent);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});






app.post('/run-tests', async (req, res) => {
    const { fullname, testFilePath } = req.body;
    const api = new Api();

    try {
        // 1. Klona repository till servern
        const repoPath = await cloneRepository(fullname);

        // 2. Kör testerna och få resultat
        const testResults = await runTests(repoPath, testFilePath);

        // 3. Returnera testresultaten till klienten
        res.json({ success: true, testResults });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});



async function cloneRepository(fullname) {
    const repoPath = path.join(__dirname, 'repositories', fullname.replace('/', '_')); // Spara under en unik mapp
    const git = simpleGit();

    try {
        if (fs.existsSync(repoPath)) {
            // Om mappen redan finns, uppdatera repo istället för att klona om
            await git.cwd(repoPath).pull();
        } else {
            // Klona om mappen inte finns
            await git.clone(`https://github.com/${fullname}.git`, repoPath);
        }

        console.log(`Repository ${fullname} cloned successfully to ${repoPath}`);
        return repoPath;
    } catch (error) {
        console.error(`Failed to clone repository: ${error.message}`);
    }
}

const { exec } = require('child_process');

async function runTests(repoPath, testFilePath) {
    return new Promise((resolve, reject) => {
        exec(`npx mocha ${path.join(repoPath, testFilePath)}`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error running tests: ${stderr}`);
            }
            resolve(stdout); // Returnerar testresultaten som sträng
        });
    });
}





app.post('/submit-review', async (req, res) => {
    const { repoFullname, reviewComment } = req.body;
    // Spara kommentaren till GitHub eller databas
    // ...
    res.status(200).json({ message: 'Review submitted successfully' });
});





// Confirm that the server is running
app.listen(PORT, () => {

    // Console log that server is running and on which PORT
    console.log(`Server running on port ${PORT}`);
});