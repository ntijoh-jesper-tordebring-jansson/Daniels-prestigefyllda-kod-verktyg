export async function loadStyles (styleFile) {
    const response = await fetch(`src/css/${styleFile}.css`)
    return await response.text()
}