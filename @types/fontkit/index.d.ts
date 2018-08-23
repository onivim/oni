interface Glyph {
    id: any
    codePoints: number[]
    advanceWidth: number
    // Leaving out the rest for now
}

interface Font {
    glyphsForString(string): Glyph[]
    // Leaving out the rest for now
}

interface Fontkit {
    openSync(filename: string, postscriptName = null): Font
    // Leaving out the rest for now
}

declare module "fontkit" {
    const fontkit: Fontkit

    export default fontkit
}
