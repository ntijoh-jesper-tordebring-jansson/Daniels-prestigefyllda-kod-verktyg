const dotenv = require('dotenv')
dotenv.config();

class Api {
    constructor() {
        this.token = process.env.GITHUB_API_TOKEN;
    }

    async getRepository(name) {
        this.url = `https://api.github.com/users/${name}/repos`;
        this.repositories = [];

        try {
            const response = await fetch(this.url, {
                headers: {
                    "Authorization": `token ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
    
            const json = await response.json();

            for (let i = 0; i < json.length; i++) {
                this.repositories.push(
                    { "full_name" : json[i].full_name, "name" : json[i].name, "url" : json[i].html_url, "forks_count" : json[i].forks_count }
                );
            }

            return this.repositories;
        } catch (error) {
            console.error(error.message);
        }
    }

    async getForks(fullname) {
        this.url = `https://api.github.com/repos/${fullname}/forks`;
        this.forks = [];

        try {
            const response = await fetch(this.url, {
                headers: {
                    "Authorization": `token ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
    
            const json = await response.json();

            for (let i = 0; i < json.length; i++) {
                this.forks.push(
                    { "full_name" : json[i] }
                );
            }

            return this.forks;
        } catch (error) {
            console.error(error.message);
        }
    }



    async getManifestFile(fullname) {
        this.url = `https://api.github.com/repos/${fullname}/contents/.manifest.json`;
    
        try {
            const response = await fetch(this.url, {
                headers: {
                    "Authorization": `token ${this.token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`); // Kasta fel om filen inte hittas
            }
    
            const json = await response.json();
            
            if (!json.content) {
                throw new Error('Manifest file content is empty');
            }
    
            const content = Buffer.from(json.content, 'base64').toString();
            return JSON.parse(content); // Returnera JSON-innehåll
        } catch (error) {
            console.error(`Error fetching manifest file for ${fullname}: ${error.message}`);
            throw error;
        }
    }



    async getFileContent(fullname, filePath) {
        this.url = `https://api.github.com/repos/${fullname}/contents/${filePath}`;
    
        try {
            const response = await fetch(this.url, {
                headers: {
                    "Authorization": `token ${this.token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
    
            const json = await response.json();
            const content = Buffer.from(json.content, 'base64').toString();
            return content; // Returnerar innehållet i filen
        } catch (error) {
            console.error(error.message);
        }
    }
}

module.exports = Api;