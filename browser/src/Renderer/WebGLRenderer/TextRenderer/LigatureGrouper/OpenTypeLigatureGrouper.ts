import fontManager from "font-manager"
import * as fs from "fs"
import * as Log from "oni-core-logging"
import oniFontkit, { Font } from "oni-fontkit"

import { ILigatureGrouper } from "./ILigatureGrouper"

const ligatureFeatures = ["calt", "rclt", "liga", "dlig", "clig"]

export class OpenTypeLigatureGrouper implements ILigatureGrouper {
    private readonly _font = loadFont(this._fontFamily)
    private readonly _fontHasLigatures = this._font && checkIfFontHasLigatures(this._font)
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
        // Apply ligatures and get the contextGroup metadata in the Glyphs where context-based replacements happened
        const contextGroupArray = this._font.applySubstitutionFeatures(fontGlyphs, ligatureFeatures)
        const ligatureGroups: string[] = []
        let currentContextGroupId: number = null
        contextGroupArray.forEach((contextGroupId, index) => {
            if (contextGroupId !== currentContextGroupId) {
                currentContextGroupId = contextGroupId
                ligatureGroups.push("")
            }
            ligatureGroups[ligatureGroups.length - 1] += concatenatedCharacters[index]
        })

        this._cache.set(concatenatedCharacters, ligatureGroups)
        return [...ligatureGroups]
    }
}

const loadFont = (fontFamily: string) => {
    try {
        const fontDescriptor = fontManager.findFontSync({
            // We use fontFamily in both family and postscriptName to raise the chance of successfully finding the right font.
            // font-manager does not require both to be matched at the same time, so this makes it more robust.
            family: fontFamily,
            postscriptName: fontFamily,
        })

        if (!fontDescriptor) {
            Log.warn(
                `[OpenTypeLigatureGrouper] Could not find installed font for font family '${fontFamily}'. Ligatures won't be available.`,
            )
            return null
        }

        const fontFileBuffer = fs.readFileSync(fontDescriptor.path)
        const font = oniFontkit.create(fontFileBuffer)
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
    const fontHasLigatures = ligatureFeatures.some(
        ligatureFeature =>
            font && font.availableFeatures && font.availableFeatures.includes(ligatureFeature),
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
