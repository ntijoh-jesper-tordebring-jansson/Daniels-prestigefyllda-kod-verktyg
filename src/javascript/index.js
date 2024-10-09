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
      <div id="fortniteDiv">
          <h2>TETA</h2>
      </div>
    `;
  }

  async #loadStyles() {
    const response = await fetch('src/css/style-index.css'); // Adjust the path if necessary
    return await response.text();
  }
}

customElements.define('my-index', MyIndex);
