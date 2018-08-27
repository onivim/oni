import colorNormalize from "color-normalize"

const cache = new Map<string, Float32Array>()

export const normalizeColor = (cssColor: string) => {
    const cachedRgba = cache.get(cssColor)

    if (cachedRgba) {
        return cachedRgba
    } else {
        const rgba = colorNormalize(cssColor, "float32")
        cache.set(cssColor, rgba)
        return rgba
    }
}
