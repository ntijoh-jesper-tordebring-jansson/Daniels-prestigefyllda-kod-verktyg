import { loadStyles } from "./globalFunctions.js";
import { repoController } from "./repoController.js";

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
      repoController.displayRepos(data) // Call the display function
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
}

customElements.define('my-index', MyIndex)
