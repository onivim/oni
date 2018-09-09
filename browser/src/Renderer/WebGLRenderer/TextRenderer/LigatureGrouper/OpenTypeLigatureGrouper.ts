import fontManager from "font-manager"
import fontkit, { Font } from "fontkit"
import * as fs from "fs"
import * as groupBy from "lodash/groupBy"
import * as Log from "oni-core-logging"

import { GlyphInfo } from "./GlyphInfo"
import { GlyphSubstitutor } from "./GlyphSubstitutor"
import { ILigatureGrouper } from "./ILigatureGrouper"

const ligatureFeatures = ["calt", "rclt", "liga", "dlig", "clig"]

export class OpenTypeLigatureGrouper implements ILigatureGrouper {
    private readonly _font = loadFont(this._fontFamily)
    private readonly _fontHasLigatures = this._font && checkIfFontHasLigatures(this._font)
    private readonly _glyphSubstitutor = new GlyphSubstitutor(this._font)
    private readonly _cache = new Map<string, string[]>()

    constructor(private _fontFamily: string) {}

    public getLigatureGroups(characters: string[]) {
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
        this._glyphSubstitutor.applyFeatures(ligatureFeatures, glyphInfos)

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

const loadFont = (fontFamily: string) => {
    try {
        const fontDescriptor = fontManager.findFontSync({ family: fontFamily })

        if (!fontDescriptor) {
            Log.warn(
                `[OpenTypeLigatureGrouper] Could not find installed font for font family '${fontFamily}'. Ligatures won't be available.`,
            )
            return null
        }

        const fontFileBuffer = fs.readFileSync(fontDescriptor.path)
        const font = fontkit.create(fontFileBuffer)
        Log.verbose(
            `[OpenTypeLigatureGrouper] Using font ${fontDescriptor.postscriptName} located at ${
                fontDescriptor.path
            } for finding ligatures in '${fontFamily}'`,
        )
        return font
    } catch (error) {
        Log.warn(
            `[OpenTypeLigatureGrouper] Error loading font file for font family '${fontFamily}': ${error} Ligatures won't be available.`,
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
            `[OpenTypeLigatureGrouper] Found ligatures in '${
                font.postscriptName
            }'. Ligatures will be available.`,
        )
        return true
    } else {
        Log.verbose(
            `[OpenTypeLigatureGrouper] Could not find ligatures in '${
                font.postscriptName
            }'. Ligatures won't be available.`,
        )
        return false
    }
}
