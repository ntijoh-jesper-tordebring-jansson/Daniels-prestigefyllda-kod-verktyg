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
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"> <!-- Include the Material Icons font in the Shadow DOM -->
      <header>
          <span id="profileIcon" class="material-icons">&#xe851;</span>  <!-- Correct icon usage -->
          
      </header>
      <main>
          <h1>Welcome to Teacher-O-Matic!</h1>
          <p>Enter your GitHub username in the header field</p>
      </main>
    `;
  }

  async #loadStyles() {
    const response = await fetch('src/css/style-index.css'); // Adjust the path if necessary
    return await response.text();
  }
}

customElements.define('my-index', MyIndex);
