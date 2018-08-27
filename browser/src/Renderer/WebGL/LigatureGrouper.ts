import fontkit from "fontkit"
import * as fs from "fs"
import * as groupBy from "lodash/groupBy"

import GlyphInfo from "./fontLayout/GlyphInfo"
import GSUBProcessor from "./fontLayout/GSUBProcessor"

const fontFileBuffer = fs.readFileSync("/Users/mane/Library/Fonts/FiraCode-Regular.otf")
const font = fontkit.create(fontFileBuffer)

const ligatureFeatures = ["calt", "rclt", "liga", "dlig", "clig"]

export class LigatureGrouper {
    private _font: Font = font
    private readonly _fontHasLigatures = ligatureFeatures.some(ligatureFeature =>
        this._font.availableFeatures.includes(ligatureFeature),
    )
    private _processor = new GSUBProcessor(this._font as any, (this._font as any).GSUB)
    private _cache = new Map<string, string[]>()

    constructor(fontFamily: string) {}

    getLigatureGroups(characters: string[]) {
        if (!this._fontHasLigatures) {
            return characters
        }

        const concatenatedCharacters = characters.join("")

        const cachedLigatureGroups = this._cache.get(concatenatedCharacters)
        if (cachedLigatureGroups) {
            return cachedLigatureGroups
        }

        const fontGlyphs = this._font.glyphsForString(concatenatedCharacters)
        const glyphInfos = fontGlyphs.map(
            glyph => new GlyphInfo(this._font, glyph.id, [...glyph.codePoints], ligatureFeatures),
        )
        // Apply ligatures and store contextGroup metadata in the GlyphInfos wherever they applied
        this._processor.applyFeatures(ligatureFeatures, glyphInfos, null)

        // Group GlyphInfo[] by contextGroup
        const contextGroupDictionary = groupBy(glyphInfos, glyphInfo => glyphInfo.contextGroup)
        const contextGroupSymbols = Object.getOwnPropertySymbols(contextGroupDictionary)
        // TODO remove the "as any" once we upgraded to TS 3
        const contextGroups = contextGroupSymbols.map(
            contextGroupSymbol => contextGroupDictionary[contextGroupSymbol as any],
        )

        // Map GlyphInfo[][] to string[]
        const ligatureGroups = contextGroups.map(glyphsInContextGroup =>
            glyphsInContextGroup.map(glyph => String.fromCodePoint(...glyph.codePoints)).join(""),
        )

        this._cache.set(concatenatedCharacters, ligatureGroups)
        return [...ligatureGroups]
    }
}
