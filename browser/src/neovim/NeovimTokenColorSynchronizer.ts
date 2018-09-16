/**
 * NeovimTokenColorSynchronizer
 *
 * This is a helper that pushes all the token colors to Neovim
 * as custom highlight groups.
 */

import * as Color from "color"

import * as Log from "oni-core-logging"

import { TokenColor } from "./../Services/TokenColors"

import { NeovimInstance } from "./NeovimInstance"

const getGuiStringFromTokenColor = ({ settings: { fontStyle } }: TokenColor): string => {
    if (!fontStyle) {
        return "gui=none"
    } else if (fontStyle.includes("bold italic")) {
        return "gui=bold,italic"
    } else if (fontStyle === "bold") {
        return "gui=bold"
    } else if (fontStyle === "italic") {
        return "gui=italic"
    } else {
        return "gui=none"
    }
}

type StringMap = {
    [key: string]: string
}

export class NeovimTokenColorSynchronizer {
    private _currentIndex = 0
    private _tokenScopeSelectorToHighlightName: StringMap = {}
    private _highlightNameToHighlightValue: StringMap = {}

    constructor(private _neovimInstance: NeovimInstance) {
        this._neovimInstance.onColorsChanged.subscribe(() => {
            this._highlightNameToHighlightValue = {}
        })
    }

    // This method creates highlight groups for any token colors that haven't been set yet
    public async synchronizeTokenColors(tokenColors: TokenColor[]) {
        const highlightsToAdd = tokenColors.reduce<string[]>((newHighlights, tokenColor) => {
            const highlightName = this._getOrCreateHighlightGroup(tokenColor)
            const highlightFromScope = this._convertTokenStyleToHighlightInfo(tokenColor)

            const currentHighlight = this._highlightNameToHighlightValue[highlightName]

            if (currentHighlight === highlightFromScope) {
                return newHighlights
            }
            this._highlightNameToHighlightValue[highlightName] = highlightFromScope
            return [...newHighlights, highlightFromScope]
        }, [])

        const atomicCalls = highlightsToAdd.map(hlCommand => ["nvim_command", [hlCommand]])

        if (!atomicCalls.length) {
            return
        }

        Log.info(
            `[NeovimTokenColorSynchronizer::synchronizeTokenColors] Setting ${
                atomicCalls.length
            } highlights`,
        )
        this._neovimInstance.request("nvim_call_atomic", [atomicCalls])
        Log.info(
            "[NeovimTokenColorSynchronizer::synchronizeTokenColors] Highlights set successfully",
        )
    }

    /**
     * Gets the highlight group for the particular token color. Requires that `synchronizeTokenColors` has been called
     * previously.
     */
    public getHighlightGroupForTokenColor(tokenColor: TokenColor): string {
        return this._getOrCreateHighlightGroup(tokenColor)
    }

    private _convertTokenStyleToHighlightInfo(tokenColor: TokenColor): string {
        const name = this._getOrCreateHighlightGroup(tokenColor)
        const foregroundColor = Color(tokenColor.settings.foreground).hex()
        const backgroundColor = Color(tokenColor.settings.background).hex()
        const gui = getGuiStringFromTokenColor(tokenColor)
        return `:hi! ${name} guifg=${foregroundColor} guibg=${backgroundColor} ${gui}`
    }

    private _getOrCreateHighlightGroup(tokenColor: TokenColor): string {
        const tokenKey = this._getKeyFromTokenColor(tokenColor)
        const existingGroup = this._tokenScopeSelectorToHighlightName[tokenKey]

        if (existingGroup) {
            return existingGroup
        } else {
            this._currentIndex++
            const newHighlightGroupName = "oni_highlight_" + this._currentIndex.toString()
            Log.verbose(
                "[NeovimTokenColorSynchronizer::_getOrCreateHighlightGroup] Creating new highlight group - " +
                    newHighlightGroupName,
            )
            this._tokenScopeSelectorToHighlightName[
                this._getKeyFromTokenColor(tokenColor)
            ] = newHighlightGroupName
            return newHighlightGroupName
        }
    }

    private _getKeyFromTokenColor(tokenColor: TokenColor): string {
        const {
            settings: { background = "none", foreground = "none", fontStyle = "none" },
        } = tokenColor
        const separator = `__`
        const bg = `background-${background}`
        const fg = `foreground-${foreground}`
        const bold = `bold-${fontStyle ? fontStyle.includes("bold") : false}`
        const italic = `italic-${fontStyle ? fontStyle.includes("italic") : false}`
        return [tokenColor.scope, bg, fg, bold, italic].join(separator)
    }
}
