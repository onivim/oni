/**
 * NeovimTokenColorSynchronizer
 *
 * This is a helper that pushes all the token colors to Neovim
 * as custom highlight groups.
 */

import * as Color from "color"
import { TokenColor } from "./../Services/TokenColors"

import { NeovimInstance } from "./NeovimInstance"

import * as Log from "./../Log"

export class NeovimTokenColorSynchronizer {
    private _currentIndex: number = 0
    private _tokenScopeSelectorToHighlightName: { [key: string]: string } = {}
    private _highlightNameToHighlightValue: { [key: string]: string } = {}

    constructor(private _neovimInstance: NeovimInstance) {}

    // This method creates highlight groups for any token colors that haven't been set yet
    public async synchronizeTokenColors(tokenColors: TokenColor[]): Promise<void> {
        const promises = tokenColors.map(async tokenColor => {
            const highlightName = this._getOrCreateHighlightGroup(tokenColor)
            const highlightFromScope = this._convertTokenStyleToHighlightInfo(tokenColor)

            const currentHighlight = this._highlightNameToHighlightValue[highlightName]

            if (currentHighlight === highlightFromScope) {
                return
            } else {
                await this._neovimInstance.command(highlightFromScope)
                this._highlightNameToHighlightValue[highlightName] = highlightFromScope
            }
        })

        await Promise.all(promises)
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
        const foregroundColor = Color(tokenColor.settings.foregroundColor).hex()
        const backgroundColor = Color(tokenColor.settings.backgroundColor).hex()
        return `:hi ${name} guifg=${foregroundColor} guibg=${backgroundColor}`
    }

    private _getOrCreateHighlightGroup(tokenColor: TokenColor): string {
        const existingGroup = this._tokenScopeSelectorToHighlightName[tokenColor.scope]
        if (existingGroup) {
            return existingGroup
        } else {
            this._currentIndex++
            const newHighlightGroupName = "oni_highlight_" + this._currentIndex.toString()
            Log.verbose(
                "[NeovimTokenColorSynchronizer::_getOrCreateHighlightGroup] Creating new highlight group - " +
                    newHighlightGroupName,
            )
            this._tokenScopeSelectorToHighlightName[tokenColor.scope] = newHighlightGroupName
            return newHighlightGroupName
        }
    }
}
