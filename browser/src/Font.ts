export const FallbackFonts = "Consolas,Monaco,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace"

export interface IFontMeasurement {
    width: number
    height: number
}

export function measureFont(fontFamily: string, fontSize: string, characterToTest?: string) {
    characterToTest = characterToTest || "H"
    const div = document.createElement("div")

    div.style.position = "absolute"
    div.style.left = "10px"
    div.style.top = "10px"
    div.style.backgroundColor = "red"
    div.style.left = "-1000px"
    div.style.top = "-1000px"

    div.textContent = "H"
    div.style.fontFamily = `${fontFamily},${FallbackFonts}`
    div.style.fontSize = fontSize

    document.body.appendChild(div)

    const rect = div.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    return {
        width,
        height,
    }
}
