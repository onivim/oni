declare module "fontkit" {
    declare const fontkit: Fontkit

    export interface Font {
        postscriptName: string
        fullName?: string
        familyName?: string
        subfamilyName?: string
        copyright?: string
        version?: string

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

    export type TextDirection = "" | "ltr" | "rtl"

    export interface Glyph {
        id: any
        codePoints: number[]
        advanceWidth: number
        // Leaving out the rest for now
    }

    export interface GlyphRun {
        glyphs: Glyph[]
        // Leaving out the rest for now
    }

    interface Fontkit {
        openSync(filename: string, postscriptName = null): Font
        create(buffer: Buffer): Font
        // Leaving out the rest for now
    }

    export default fontkit
}
