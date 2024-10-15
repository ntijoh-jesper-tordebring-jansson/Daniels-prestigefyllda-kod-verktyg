class MyIndex extends HTMLElement {
  isInputInFocus = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback () {
    const styles = await this.#loadStyles('style-index')
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
    
    this.#clearSite();

    const styles = await this.#loadStyles('style-repo')

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

  #clearSite() {
    const repoList = this.shadowRoot.querySelector('#repoList')
    const forkList = this.shadowRoot.querySelector('#forkList')

    repoList.innerHTML = '';
    forkList.innerHTML = '';
  }

  async forkRender (forkData) {
    this.#clearSite();
    
    const forkList = this.shadowRoot.querySelector('#forkList')

    const styles = await this.#loadStyles('style-fork')

    for (const fork of forkData) {
      const forkItem = document.createElement('div')

      const [username, repoName] = fork.full_name.split('/')
      forkItem.innerHTML = `
        <style>
            ${styles}
        </style>
        <div id="forkDiv">
            <h3>${username}/${repoName}</h3>
               <pre><code class="javascript">
                  ${fork.fileContent}


            <a href="${fork.gh_link}" target="_blank">Show on Github</a>
            <div id="${username + repoName}-tests" class="forkTest"></div>
  
            <form id="commentForm">
                <label class="commentLabel">
                  <input type="text" id="commentInput" placeholder=" " />
                  <span class="floatingCommentLabel">Comment</span>
                </label>

                <label>
                    <input class="optionInput" type="radio" name="action_required" id="option1" value="option1">
                    <p class="optionLabel"><span>&#10003;</span> Klar</p>
                </label>
                <label>
                    <input class="optionInput" type="radio" name="action_required" id="option2" value="option2">
                    <p class="optionLabel"><span>&#10227;</span> Åtgärd Krävs</p>
                </label>
                <label>
                    <input class="optionInput" type="radio" name="action_required" id="option3" value="option3" checked>
                    <p class="optionLabel"><span>&#8856;</span> Ej bedömd</p>
                </label>

                <button type="submit">Save</button>
            </form>
        </div>
      `


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
        
		this.shadowRoot.querySelector(`.${username + repoName}-comment`).value = fork.comment;

		console.log(`${username + repoName}`);

		switch (fork.status) {
			case "done":
				this.shadowRoot.querySelector(`.${username + repoName}-status-done`).checked = true;
				break;
			case "action_required":
				this.shadowRoot.querySelector(`.${username + repoName}-status-action_required`).checked = true;
				break;
			case "not_graded":
				this.shadowRoot.querySelector(`.${username + repoName}-status-not_graded`).checked = true;
				break;
		}


		this.shadowRoot.querySelector(`.${username + repoName}-submit-form`).addEventListener('click', async (e) => {
			e.preventDefault();
			const text = this.shadowRoot.querySelector(`.${username + repoName}-comment`).value;
			const status = this.shadowRoot.querySelector(`#${username + repoName}-optionsForm`).action_required.value;

			console.log(text + " " + status);

			try {
			const response = await fetch('/submit-review', {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json'
				},
				body: JSON.stringify({ "repoFullname" : username + "/" + repoName, "reviewComment" : text, "status" : status })
			})
		
			if (!response.ok) {
				throw new Error('Failed to fetch forks')
			}
		
		
			this.forkRender();
			} catch (error) {
			console.error('Error fetching forks:', error)
			}
		})



		const testContainer = this.shadowRoot.querySelector(`#${username + repoName}-tests`);
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

  async #loadStyles (styleFile) {
    const response = await fetch(`src/css/${styleFile}.css`)
    return await response.text()
  }
}

customElements.define('my-index', MyIndex)
