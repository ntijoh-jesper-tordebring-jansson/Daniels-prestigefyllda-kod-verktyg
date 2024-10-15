import { loadStyles } from "./globalFunctions.js";
import { handleForks } from "./index.js";

export class RepoCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    async connectedCallback() {
        const styles = await loadStyles("style-repo");

        this.shadowRoot.innerHTML = `
            <style>
                ${styles}
            </style>
            <div id="forkWrapper"> 
                <h3 id='repoH3' class="repoName"></h3>
                <div class="infoText">
                    <a class="forkButton">Show Forks</a>
                    <span>|</span>
                    <a href="" target="_blank" class="repoGithubLink">Show on Github</a>
                    <p class="repoForkCount"></p>
                </div>
            </div>
        `

        this.#renderAttributes();

        this.shadowRoot.querySelector('.forkButton').addEventListener('click', () =>
            handleForks(this.getAttribute('data-repoFullName'))
        )
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector('.forkButton').removeEventListener('click', handleForks);
    }

    #renderAttributes() {
        this.shadowRoot.querySelector('.repoName').innerText = `${this.getAttribute('data-repoName')}`;
        this.shadowRoot.querySelector('.repoGithubLink').href = this.getAttribute('data-githubLink');
        this.shadowRoot.querySelector('.repoForkCount').innerHTML = this.getAttribute('data-forkCount');
    }
}

customElements.define('repo-card', RepoCard)