import { loadStyles } from "./globalFunctions.js";

class ForkCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    async connectedCallback() {
        const styles = await loadStyles("style-fork");

        this.shadowRoot.innerHTML = `
            <style>
                ${styles}
            </style>
            <div id="forkDiv">
                <h3 class="forkTitle"></h3>
                <pre><code class="javascript"></code></pre>

                <a href="" target="_blank" class="githubLink">Show on Github</a>
                <div class="forkTest"></div>

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

        this.#renderAttributes();
    }

    #renderAttributes() {
        this.shadowRoot.querySelector('.forkTitle').innerText = `${this.getAttribute('data-username')}/${this.getAttribute('data-reponame')}`;
        this.shadowRoot.querySelector('.javascript').innerText = this.getAttribute('data-javascriptcode');
        this.shadowRoot.querySelector('.githubLink').href = this.getAttribute('data-githublink');
        this.shadowRoot.querySelector('.forkTest').id = `${this.getAttribute('data-username') + this.getAttribute('data-reponame')}-tests`;
    }
}

customElements.define('fork-card', ForkCard)