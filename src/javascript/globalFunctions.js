export async function loadStyles (styleFile) {
    const response = await fetch(`src/css/${styleFile}.css`)
    return await response.text()
}

export function clearSite() {
    const repoList = document.querySelector("my-index").shadowRoot.querySelector("#repoList");
    const forkList = document.querySelector("my-index").shadowRoot.querySelector("#forkList");

    repoList.innerHTML = "";
    forkList.innerHTML = "";
}