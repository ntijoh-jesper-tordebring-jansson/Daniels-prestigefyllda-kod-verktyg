import { loadStyles, clearSite } from "./globalFunctions.js";
import { ForkCard } from "./forkCard.js";

class MyIndex extends HTMLElement {
  isInputInFocus = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback () {
    const styles = await loadStyles('style-index');
    this.shadowRoot.innerHTML = `
      <style>
        ${styles}
      </style>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <header>
          <form id="githubForm">
            <span id="profileIcon" class="material-icons">&#xe851;</span>
            <input type="text" id="username" class="notInFocus" required />
          </form>
      </header>
      <main id="mainContent">
          <div id="introText">
            <h1>Welcome to Teacher-O-Matic!</h1>
            <p>Enter your GitHub username in the header field</p>
          </div>
          <div id="repoList"></div> <!-- Container for the repos -->
          <div id="forkList"></div> <!-- Container for the forks -->
      </main>
    `

    const inputField = this.shadowRoot.querySelector('#username');

    inputField.addEventListener('keydown', (event) => {
      if(event.code === "Enter") {
        event.preventDefault();

        const username = this.shadowRoot.querySelector('#username').value;
        this.handleSubmit(username);
      }
    });

    inputField.addEventListener('focus', () => {
      this.#ToggleInputFocus();
    })

    inputField.addEventListener('focusout', () => {
      this.#ToggleInputFocus();
    })
  }

  disconnectedCallback() {
    const inputField = this.shadowRoot.querySelector('#username');

    inputField.removeEventListener('keydown');
    inputField.removeEventListener('focus');
    inputField.removeEventListener('focusout');
  }

  #ToggleInputFocus() {
    this.isInputInFocus = !this.isInputInFocus;
    let header = this.shadowRoot.querySelector('header');
    let profileIcon = this.shadowRoot.querySelector('#profileIcon');
    let inputField = this.shadowRoot.querySelector('#username');

    if(this.isInputInFocus) {
      inputField.className = "inFocus"
      header.style.backgroundColor = "White";
      profileIcon.style.color = "Black";
    } else { 
      inputField.className = "notInFocus"
      header.style.backgroundColor = "rgb(240,108,116)";
      profileIcon.style.color = "White";
    }
  }

  async handleSubmit (username) {
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos`
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      this.clearIntroText() // Clear the intro text
      this.displayRepos(data) // Call the display function
    } catch (error) {
      console.error('Error fetching repos:', error)
    }
  }

  clearIntroText () {
    const introText = this.shadowRoot.querySelector('#introText')
    if (introText) {
      introText.remove()
    }
  }

  async displayRepos (repos) {
    const repoList = this.shadowRoot.querySelector('#repoList')
    
    clearSite();

    const styles = await loadStyles('style-repo');

    if (repos.length === 0) {
      repoList.innerHTML = '<p>No repositories found for this user.</p>'
      return
    }

    repos.forEach(repo => {
      const repoItem = document.createElement('div')

      repoItem.innerHTML = `
        <style>
          ${styles}
        </style>
        <div id="forkWrapper"> 
          <h3 id='repoH3'>${repo.name}</h3>
          <div class="infoText">
            <a class="forkButton">Show Forks</a>
            <span>|</span>
            <a href="${repo.html_url}" target="_blank">Show on Github</a>
            <p>${repo.forks_count}</p>
          </div>
        </div>
      `
      const forkButton = repoItem.querySelector('.forkButton')
      forkButton.addEventListener('click', () =>
        this.handleForks(repo.full_name)
      )
      repoList.appendChild(repoItem)
    })
  }

  async handleForks (fullname) {
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
      this.forkRender(data)
    } catch (error) {
      console.error('Error fetching forks:', error)
    }
  }

  async forkRender (forkData) {
    clearSite();
    
    const forkList = this.shadowRoot.querySelector('#forkList')

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

customElements.define('my-index', MyIndex)
