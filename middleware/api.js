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

            for(let i = 0; i < json.length; i++) {
                this.repositories.push(
                    { "full_name" : json[i].full_name, "name" : json[i].name, "url" : json[i].html_url, "forks_count" : json[i].forks_count }
                );
            }

            return this.repositories;
        } catch (error) {
            console.error(error.message);
        }
    }
}

module.exports = Api;