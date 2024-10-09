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
        <main>
            <h1>Welcome to Teacher-O-Matic!</h1>
            <p>Enter your GitHub username in the header field</p>
        </main>
      `;
  
      // Attach event listener for form submission
      const form = this.shadowRoot.getElementById('githubForm');
      form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        const username = this.shadowRoot.getElementById('username').value;
        this.handleSubmit(username);
      });
    }
  
    handleSubmit(username) {
      console.log('GitHub Username:', username); // Handle the username (e.g., fetch user data)
      // Additional functionality can be added here.
    }
  
    async #loadStyles() {
      const response = await fetch('src/css/style-index.css'); // Adjust the path if necessary
      return await response.text();
    }
  }
  
  customElements.define('my-index', MyIndex);
  