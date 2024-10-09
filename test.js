const dotenv = require('dotenv')
dotenv.config();

async function getApi() {
    const username = "ntijoh-jesper-tordebring-jansson";
    const url = `https://api.github.com/users/${username}/repos`;
    const token = process.env.GITHUB_API_TOKEN

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `token ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        
        const json = await response.json();
        console.log(json);
    } catch (error) {
        console.error(error.message);
    }
}


getApi();
