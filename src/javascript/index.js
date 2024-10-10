class MyIndex extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const styles = await this.#loadStyles();
    this.shadowRoot.innerHTML = `
      <style>
        ${styles}
      </style>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <header>
          <span id="profileIcon" class="material-icons">&#xe851;</span>
          <form id="githubForm">
            <input type="text" id="username" placeholder="Enter GitHub username" required />
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

  // Function to clear intro text
  clearIntroText() {
    const introText = this.shadowRoot.getElementById('introText');
    if (introText) {
      introText.remove();  // Remove the intro text div from the DOM
    }
  }

  // Function to display repositories (without description)
  displayRepos(repos) {
    const repoList = this.shadowRoot.getElementById('repoList');
    repoList.innerHTML = '';  // Clear any previous content

    if (repos.length === 0) {
      repoList.innerHTML = '<p>No repositories found for this user.</p>';
      return;
    }

    repos.forEach(repo => {
      const repoItem = document.createElement('div');
      repoItem.innerHTML = `
        <h3>${repo.name}</h3>
        <button></button>
        <a href="${repo.html_url}" target="_blank">Show on Github</a>
        <p>${repo.forks_count}</p>
      `;
      repoList.appendChild(repoItem);
    });
  }

  async #loadStyles() {
    const response = await fetch('src/css/style-index.css');
    return await response.text();
  }
}

customElements.define('my-index', MyIndex);
