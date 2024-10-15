import { clearSite } from "./globalFunctions.js";
import { forkController } from "./forkController.js"
import { RepoCard } from "./repoCard.js";

export class repoController {
    static displayRepos (repos) {
        const repoList = document.querySelector("my-index").shadowRoot.querySelector('#repoList')
        
        clearSite();
    
        if (repos.length === 0) {
          repoList.innerHTML = '<p>No repositories found for this user.</p>'
          return
        }
    
        repos.forEach(repo => {
          const repoItem = document.createElement('repo-card')
    
          repoItem.setAttribute('data-repoName', repo.name);
          repoItem.setAttribute('data-githubLink', repo.html_url);
          repoItem.setAttribute('data-forkCount', repo.forks_count);
          repoItem.setAttribute('data-repoFullName', repo.full_name);
    
          repoList.appendChild(repoItem)
        })
    }

    static async handleForks (fullname) {
        try {
          const response = await fetch('/get-forks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullname: fullname })
          })
      
          if (!response.ok) {
            throw new Error('Failed to fetch forks')
          }
      
          const data = await response.json()
          if (data.length === 0) {
            console.log('No forks in this repo')
            return
          }
          forkController.forkRender(data)
        } catch (error) {
          console.error('Error fetching forks:', error)
        }
      }
}