const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class Tests {
    async cloneRepository(fullname) {
        const repoPath = path.join(__dirname, 'repositories', fullname.replace('/', '_'));
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

    async runTests(manifest, fileContent) {
        const results = [];

        try {
            // Lägg till module.exports automatiskt till koden för att exportera funktionen
            const modifiedFileContent = `
                ${fileContent}
                module.exports = { ${manifest.functionName} };
            `;

            // Skapa en tillfällig fil för att köra testerna
            const tempFilePath = path.join(__dirname, 'temp.js');
            fs.writeFileSync(tempFilePath, modifiedFileContent);

            // Ladda filen och hämta funktionen
            const { [manifest.functionName]: func } = require(tempFilePath);

            // Kontrollera om funktionen är definierad
            if (typeof func !== 'function') {
                throw new Error(`${manifest.functionName} is not defined`);
            }

            // Loopa igenom alla tester i manifestet
            for (const test of manifest.tests) {
                const { description, arguments: args, expected } = test;

                // Kör funktionen med angivna argument
                const result = func(...args);

                // Jämför resultatet strikt med det förväntade värdet
                if (result === expected) {
                    results.push({ description, status: 'passed' });
                } else {
                    results.push({ 
                        description, 
                        status: 'failed', 
                        expected, 
                        received: result 
                    });
                }
            }

            // Radera tillfällig fil efter att testerna har körts
            fs.unlinkSync(tempFilePath);

            return results; // Returnera testresultaten
        } catch (error) {
            console.error(`Error running tests: ${error.message}`);
            return { error: error.message };
        }
    }

    async removeFile(fullname) {
        const repoPath = path.join(__dirname, 'repositories', fullname);
        fs.unlinkSync(repoPath);
    }
}

module.exports = Tests;