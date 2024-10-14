const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

class Tests {

    async cloneRepository(fullname) {
        const repoPath = path.join(__dirname, 'repositories', fullname.replace('/', '_'));
        const git = simpleGit();
    
        try {
            if (fs.existsSync(repoPath)) {
                console.log(`Repository already exists at ${repoPath}, pulling latest changes...`);
                await git.cwd(repoPath).pull();
            } else {
                console.log(`Cloning repository ${fullname}...`);
                await git.clone(`https://github.com/${fullname}.git`, repoPath);
                console.log(`Repository ${fullname} cloned successfully to ${repoPath}`);
            }
            return repoPath;
        } catch (error) {
            console.error(`Failed to clone repository: ${error.message}`);
            throw new Error('Repository cloning failed');
        }
    }

    // async cloneRepository(fullname) {
    //     const repoPath = path.join(__dirname, 'repositories', fullname.replace('/', '_'));
    //     const git = simpleGit();
    
    //     try {
    //         if (fs.existsSync(repoPath)) {
    //             await git.cwd(repoPath).pull();
    //         } else {
    //             await git.clone(`https://github.com/${fullname}.git`, repoPath);
    //         }
    
    //         console.log(`Repository ${fullname} cloned successfully to ${repoPath}`);
    //         return repoPath;
    //     } catch (error) {
    //         console.error(`Failed to clone repository: ${error.message}`);
    //     }
    // }


    async runTests(manifest, fileContent) {
        const results = [];
    
        try {
            const modifiedFileContent = `
                ${fileContent}
                module.exports = { ${manifest.functionName} };
            `;
    
            const tempFilePath = path.join(__dirname, 'temp.js');
            fs.writeFileSync(tempFilePath, modifiedFileContent);
    
            // Kontrollera om modulen kan laddas korrekt
            const { [manifest.functionName]: func } = require(tempFilePath);
    
            if (typeof func !== 'function') {
                throw new Error(`${manifest.functionName} is not defined`);
            }
    
            for (const test of manifest.tests) {
                const { description, arguments: args, expected } = test;
    
                const result = func(...args);
    
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
    
            fs.unlinkSync(tempFilePath);
    
            return results;
        } catch (error) {
            console.error(`Error running tests: ${error.message}`);
            return { error: error.message };
        }
    }



    // async runTests(manifest, fileContent) {
    //     const results = [];

    //     try {
    //         const modifiedFileContent = `
    //             ${fileContent}
    //             module.exports = { ${manifest.functionName} };
    //         `;

    //         const tempFilePath = path.join(__dirname, 'temp.js');
    //         fs.writeFileSync(tempFilePath, modifiedFileContent);

    //         const { [manifest.functionName]: func } = require(tempFilePath);

    //         if (typeof func !== 'function') {
    //             throw new Error(`${manifest.functionName} is not defined`);
    //         }

    //         for (const test of manifest.tests) {
    //             const { description, arguments: args, expected } = test;

    //             const result = func(...args);

    //             if (result === expected) {
    //                 results.push({ description, status: 'passed' });
    //             } else {
    //                 results.push({ 
    //                     description, 
    //                     status: 'failed', 
    //                     expected, 
    //                     received: result 
    //                 });
    //             }
    //         }

    //         fs.unlinkSync(tempFilePath);

    //         return results;
    //     } catch (error) {
    //         console.error(`Error running tests: ${error.message}`);
    //         return { error: error.message };
    //     }
    // }
}

module.exports = Tests;