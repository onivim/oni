/**
 * NeovimTokenColorSynchronizer
 *
 * This is a helper that pushes all the token colors to Neovim
 * as custom highlight groups.
 */

import { TokenColorStyle } from "./../Services/TokenColors"

import { NeovimInstance } from "./NeovimInstance"

import * as Log from "./../Log"

export class NeovimTokenColorSynchronizer {
    private _currentIndex: number = 0
    // private _tokenColorKeyToHighlightGroupName: { [key: string]: string } = { }
    private _tokenColorKeyToHighlightGroupName = {}

    constructor(private _neovimInstance: NeovimInstance) {}

    // This method creates highlight groups for any token colors that haven't been set yet
    public async synchronizeTokenColors(tokenColors: TokenColorStyle[]): Promise<void> {
        const promises = tokenColors.map(async tokenColor => {
            const currentHighlight = this.getHighlightGroupForTokenColorStyle(tokenColor)

            if (currentHighlight) {
                return
            } else {
                this._currentIndex++
                const newHighlightGroupName = "oni_highlight_" + this._currentIndex.toString()
                Log.verbose(
                    "[NeovimTokenColorSynchronizer::synchronizeTokenColors] Creating new highlight group - " +
                        newHighlightGroupName,
                )
                await this._neovimInstance.command(
                    ":hi " +
                        newHighlightGroupName +
                        " " +
                        this._convertTokenStyleToHighlightInfo(tokenColor),
                )
                this._setHighlightGroupForTokenColor(tokenColor, newHighlightGroupName)
            }
        })

        await Promise.all(promises)
    }

    /**
     * Gets the highlight group for the particular token color. Requires that `synchronizeTokenColors` has been called
     * previously.
     */
    public getHighlightGroupForTokenColorStyle(tokenColorStyle: TokenColorStyle): string {
        const key = this._getCacheKeyForTokenColorStyle(tokenColorStyle)
        return this._tokenColorKeyToHighlightGroupName[key]
    }

    private _convertTokenStyleToHighlightInfo(tokenColorStyle: TokenColorStyle): string {
        // TODO: Set real colors!
        return "guifg=White guibg=Red"
    }

    private _setHighlightGroupForTokenColor(
        tokenColor: TokenColorStyle,
        highlightName: string,
    ): void {
        const key = this._getCacheKeyForTokenColorStyle(tokenColor)
        this._tokenColorKeyToHighlightGroupName[key] = highlightName
    }

    private _getCacheKeyForTokenColorStyle(tokenColor: TokenColorStyle): string {
        return `${tokenColor.backgroundColor}_${tokenColor.foregroundColor}_${tokenColor.bold}_${
            tokenColor.italic
        }`
    }
}
