type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
type FontWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

interface QueryFontDescriptor {
    postscriptName?: string
    family?: string
    style?: string
    weight?: FontWeight
    width?: FontWidth
    italic?: boolean
    monospace?: boolean
}

interface ResultFontDescriptor {
    path: string
    postscriptName: string
    family: string
    style: string
    weight: FontWeight
    width: FontWidth
    italic: boolean
    monospace: boolean
}

interface FontManager {
    getAvailableFonts: (callback: (availableFonts: ResultFontDescriptor[]) => void) => void
    getAvailableFontsSync: () => ResultFontDescriptor[]

    findFonts: (
        fontDescriptor: QueryFontDescriptor,
        callback: (foundFonts: ResultFontDescriptor[]) => void,
    ) => void
    findFontsSync: (fontDescriptor: QueryFontDescriptor) => ResultFontDescriptor[]

    findFont: (
        fontDescriptor: QueryFontDescriptor,
        callback: (foundFont: ResultFontDescriptor | null) => void,
    ) => void
    findFontSync: (fontDescriptor: QueryFontDescriptor) => ResultFontDescriptor | null

    substituteFont: (
        postscriptName: string,
        text: string,
        callback: (replacement: ResultFontDescriptor[]) => void,
    ) => void
    substituteFontSync: (postscriptName: string, text: string) => ResultFontDescriptor[]
}

declare module "font-manager" {
    declare const fontManager: FontManager

    export default fontManager
}
