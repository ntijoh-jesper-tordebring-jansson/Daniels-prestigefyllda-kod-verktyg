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
  
    async handleSubmit(username) {
      console.log('GitHub Username:', username); // Log the username
  
      try {
          let formData = new FormData()
          formData.append('username', username)
          const response = await fetch('/search', {
              method: 'POST', // Specify the method as POST
              body: formData
          });
  
          if (!response.ok) {
              // Handle errors (optional)
              throw new Error('Network response was not ok');
          }
          else{
            //IF THE RESPONSE IS OK
            
          }
  
          const data = await response.json(); // Parse the JSON response
          console.log('Response data:', data); // Log the response data
          // Additional functionality can be added here.
  
      } catch (error) {
          console.error('Error fetching data:', error); // Handle errors
      }
  }
  
    async #loadStyles() {
      const response = await fetch('src/css/style-index.css'); // Adjust the path if necessary
      return await response.text();
    }
  }
  
  customElements.define('my-index', MyIndex);
  