import { clearSite } from "./globalFunctions.js";
import { ForkCard } from "./forkCard.js";

export class forkController {
    static async forkRender (forkData) {
        clearSite();
    
        const forkList = document.querySelector("my-index").shadowRoot.querySelector('#forkList')
    
        for (const fork of forkData) {
          const forkItem = document.createElement('fork-card')
          const [username, repoName] = fork.full_name.split('/')
    
          forkItem.setAttribute('data-username', username);
          forkItem.setAttribute('data-reponame', repoName);
          forkItem.setAttribute('data-javascriptcode', fork.fileContent);
          forkItem.setAttribute('data-githublink', fork.gh_link);
    
          forkList.appendChild(forkItem)
    
          console.log('hej')
    
          // Fetch test data
          try {
            const response = await fetch('/run-tests', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fullname: fork.full_name })
            })
    
            if (!response.ok) {
              throw new Error('Failed to fetch test')
            }
    
            const data = await response.json()
            
    
            const testContainer = forkItem.shadowRoot.querySelector(`#${username + repoName}-tests`);
            if (testContainer) {
                data.testResults.forEach((element) => {
                testContainer.innerHTML += `<p class="testText">Test "${element.description}": ${element.status}</p>`;
            });
            } else {
                console.error(`Test container for ${username + repoName} not found`);
            }		
            
          } catch (error) {
            console.error('Error fetching forks:', error)
          }
        }
    }
}