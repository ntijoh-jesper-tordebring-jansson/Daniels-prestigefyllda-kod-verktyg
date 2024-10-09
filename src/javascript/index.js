class MyIndex extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(this.#template());
    }
  
    #template() {
      const template = document.createElement("template");
      template.innerHTML = `
        <div>
            <h2>TETA</h2>
        </div>
      `;
      return template.content.cloneNode(true);
    }
  }
  
  customElements.define('my-index', MyIndex);
  