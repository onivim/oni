export const FallbackFonts = "Consolas,Monaco,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace"

export interface IFontMeasurement {
    width: number
    height: number
}

export function measureFont(fontFamily: string, fontSize: string, characterToTest = "H") {
    const div = document.createElement("div")

    div.style.position = "absolute"
    div.style.left = "10px"
    div.style.top = "10px"
    div.style.backgroundColor = "red"
    div.style.left = "-1000px"
    div.style.top = "-1000px"
    div.textContent = characterToTest
    div.style.fontFamily = `${fontFamily},${FallbackFonts}`
    div.style.fontSize = fontSize

    const isItalicAvailable = isStyleAvailable(fontFamily, "italic", fontSize)
    const isBoldAvailable = isStyleAvailable(fontFamily, "bold", fontSize)

    document.body.appendChild(div)

    const rect = div.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    document.body.removeChild(div)

    return {
        width,
        height,
        isItalicAvailable,
        isBoldAvailable,
    }
}

export function addDefaultUnitIfNeeded(fontSize: string) {
    const roundFont = `${Math.round(parseFloat(fontSize))}px`
    return roundFont
}

export function isStyleAvailable(fontName: string, style: string, fontSize = "12px") {
    const text = "abcdefghijklmnopqrstuvwxyz0123456789"
    let canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    context.font = `${fontSize} ${fontName}`
    const baselineSize = context.measureText(text).width
    context.font = `${style} ${fontSize} ${fontName}`
    const newSize = context.measureText(text).width
    canvas = null
    return newSize === baselineSize
}
