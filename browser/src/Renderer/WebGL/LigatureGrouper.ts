import fontManager from "font-manager"
import fontkit, { Font } from "fontkit"
import * as fs from "fs"
import * as groupBy from "lodash/groupBy"
import * as Log from "oni-core-logging"

import GlyphInfo from "./fontLayout/GlyphInfo"
import GSUBProcessor from "./fontLayout/GSUBProcessor"

const ligatureFeatures = ["calt", "rclt", "liga", "dlig", "clig"]

const loadFont = (fontFamily: string) => {
    try {
        const fontDescriptor = fontManager.findFontSync({ family: fontFamily })

        if (!fontDescriptor) {
            Log.warn(
                `[LigatureGrouper] Could not find installed font for font family '${fontFamily}'. Ligatures won't be available.`,
            )
            return null
        }

        const fontFileBuffer = fs.readFileSync(fontDescriptor.path)
        const font = fontkit.create(fontFileBuffer)
        Log.verbose(
            `[LigatureGrouper] Using font ${fontDescriptor.postscriptName} located at ${
                fontDescriptor.path
            } for finding ligatures in '${fontFamily}'`,
        )
        return font
    } catch (error) {
        Log.warn(
            `[LigatureGrouper] Error loading font file for font family '${fontFamily}': ${error} Ligatures won't be available.`,
        )
        return null
    }
}

const checkIfFontHasLigatures = (font: Font) => {
    const fontHasLigatures = ligatureFeatures.some(ligatureFeature =>
        font.availableFeatures.includes(ligatureFeature),
    )
    if (fontHasLigatures) {
        Log.verbose(
            `[LigatureGrouper] Found ligatures in '${
                font.postscriptName
            }'. Ligatures will be available.`,
        )
    } else {
        Log.verbose(
            `[LigatureGrouper] Could not find ligatures in '${
                font.postscriptName
            }'. Ligatures won't be available.`,
        )
    }
}

export class LigatureGrouper {
    private readonly _font = loadFont(this._fontFamily)
    private readonly _fontHasLigatures = this._font && checkIfFontHasLigatures(this._font)
    private readonly _processor = new GSUBProcessor(this._font as any, (this._font as any).GSUB)
    private readonly _cache = new Map<string, string[]>()

    constructor(private _fontFamily: string) {}

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
