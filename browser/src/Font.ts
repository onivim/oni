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

    div.textContent = characterToTest
    div.style.fontFamily = `${fontFamily},${FallbackFonts}`
    div.style.fontSize = fontSize

    document.body.appendChild(div)

    const rect = div.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    document.body.removeChild(div)

    return {
        width,
        height,
    }
}

export function measureFont2(fontFamily: string, fontSize: string, characterToTest?: string) {
    characterToTest = characterToTest || "H"
    const div = document.createElement("canvas")

    div.style.position = "absolute"
    div.style.width = "32px"
    div.style.height = "32px"
    div.style.backgroundColor = "red"
    div.style.left = "-1000px"
    div.style.top = "-1000px"

    const context = div.getContext("2d")
    context.font = fontSize + " " + fontFamily
    context.textBaseline = "top"
    const measurement = context.measureText(characterToTest)

    const { width } = measurement

    return {
        width,
    }
}

window["measureFont"] = measureFont
window["measureFont2"] = measureFont2

export function addDefaultUnitIfNeeded(fontSize: string) {

    const defaultUnit = "px"

    if (isNaN(Number(fontSize))) {
        return fontSize
    } else {
        return fontSize + defaultUnit
    }
}
