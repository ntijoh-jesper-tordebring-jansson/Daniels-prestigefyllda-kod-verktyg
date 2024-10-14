class MyIndex extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const styles = await this.#loadStyles("style-index");
    this.shadowRoot.innerHTML = `
      <style>
        ${styles}
      </style>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <header>
          <span id="profileIcon" class="material-icons">&#xe851;</span>
          <form id="githubForm">
            <input type="text" id="username" required />
            <button type="submit">Submit</button>
          </form>
      </header>
      <main id="mainContent">
          <div id="introText">
            <h1>Welcome to Teacher-O-Matic!</h1>
            <p>Enter your GitHub username in the header field</p>
          </div>
          <div id="repoList"></div> <!-- Container for the repos -->
      </main>
    `;

    const form = this.shadowRoot.getElementById('githubForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = this.shadowRoot.getElementById('username').value;
      this.handleSubmit(username);
    });
  }

  async handleSubmit(username) {  
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      this.clearIntroText();  // Clear the intro text
      this.displayRepos(data);  // Call the display function
    } catch (error) {
      console.error('Error fetching repos:', error);
    }
  }

  clearIntroText() {
    const introText = this.shadowRoot.getElementById('introText');
    if (introText) {
      introText.remove();
    }
  }

  async displayRepos(repos) {
    const repoList = this.shadowRoot.getElementById('repoList');
    repoList.innerHTML = '';  // Clear previous content
    const styles = await this.#loadStyles("style-repo");

    if (repos.length === 0) {
      repoList.innerHTML = '<p>No repositories found for this user.</p>';
      return;
    }

    repos.forEach(repo => {
      const repoItem = document.createElement('div');
      
      repoItem.innerHTML = `
        <style>
          ${styles}
        </style>
        <div id="forkWrapper"> 
          <h3 id='repoH3'>${repo.name}</h3>
          <div class="infoText">
            <button class="forkButton">Show Forks</button>
            <span>|</span>
            <a href="${repo.html_url}" target="_blank">Show on Github</a>
            <p>${repo.forks_count}</p>
          </div>
        </div>
      `;
      const forkButton = repoItem.querySelector('.forkButton');
      forkButton.addEventListener('click', () => this.handleForks(repo.full_name));
      repoList.appendChild(repoItem);
    });
  }

  async handleForks(fullname) {
    try {
      const response = await fetch('/get-forks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullname: fullname }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch forks');
      }
      
      const data = await response.json();
      if (data.length === 0) {
        console.log("No forks in this repo");
        return;
      }
      this.forkRender(data);
    } catch (error) {
      console.error('Error fetching forks:', error);
    }
  }

  async forkRender(forkData) {
    const repoList = this.shadowRoot.getElementById('repoList');
    repoList.innerHTML = '';  // Clear previous contents 

    const styles = await this.#loadStyles("style-fork");

    forkData.forEach(currentMap => {
      const forkItem = document.createElement('div');
      const fork = currentMap;

      const [username, repoName] = fork.full_name.split('/');
      forkItem.innerHTML = `
<style>
    ${styles}
</style>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <div id="forkDiv">
      <h3>${repoName}</h3>
      <p>by <a href="https://github.com/${username}" target="_blank">${username}</a></p>
      <a href="${fork.gh_link}" target="_blank">Show Fork on Github</a>
      <code>
      </code>
      <form id="commentform">
          <input type="text" id="commentinput" placeholder="Enter your comment" required />
          <button type="submit">Submit</button>
      </form>

      <form id="optionsForm">
          <label>
              <input type="checkbox" name="Klar" id="option1" value="option1">
              Klar
          </label>
          <label>
              <input type="checkbox" name="action_required" id="option2" value="option2">
              Åtgärd Krävs
          </label>
          <label>
              <input type="checkbox" name="assessment_status" id="option3" value="option3" checked>
              Ej bedömd
          </label>
      </form>
  </div>
      `;
      
      repoList.appendChild(forkItem);
    });
  }

  async #loadStyles(styleFile) {
    const response = await fetch(`src/css/${styleFile}.css`);
    return await response.text();
  }
}

customElements.define('my-index', MyIndex);
