interface Glyph {
    id: any
    codePoints: number[]
    advanceWidth: number
    // Leaving out the rest for now
}

interface GlyphRun {
    glyphs: Glyph[]
    // Leaving out the rest for now
}

type TextDirection = "" | "ltr" | "rtl"

interface Font {
    availableFeatures: string[]
    glyphsForString(text: string): Glyph[]
    layout(
        text: string,
        features: string[] = [],
        script?: string,
        language?: string,
        direction?: TextDirection,
    ): GlyphRun
    // Leaving out the rest for now
}

interface Fontkit {
    openSync(filename: string, postscriptName = null): Font
    create(buffer: Buffer): Font
    // Leaving out the rest for now
}

declare module "fontkit" {
    declare const fontkit: Fontkit

    export default fontkit
}
