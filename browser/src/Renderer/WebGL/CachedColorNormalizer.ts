import * as normalizeColor from "color-normalize"
import { IColorNormalizer } from "./IColorNormalizer"

export class CachedColorNormalizer implements IColorNormalizer {
    private _cache = new Map<string, Float32Array>()

    public normalizeColor(cssColor: string): Float32Array {
        const cachedRgba = this._cache.get(cssColor)

        if (cachedRgba) {
            return cachedRgba
        } else {
            const rgba = normalizeColor.call(null, cssColor, "float32")
            this._cache.set(cssColor, rgba)
            return rgba
        }
    }
}
