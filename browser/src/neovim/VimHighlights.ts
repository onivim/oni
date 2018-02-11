/**
 * VimHighlights
 *
 * Mapping of Vim highlight groups to default scopes
 */

import * as Color from "color"

import { TokenColorStyle } from "./../Services/TokenColors"

export interface IVimHighlight {
    foreground: string
    background: string
    bold: boolean
    italic: boolean
}

export const vimHighlightToTokenColorStyle = (highlight: IVimHighlight): TokenColorStyle => {
    return {
        foregroundColor: Color(highlight.foreground).hex(),
        backgroundColor: Color(highlight.background).hex(),
        bold: highlight.bold,
        italic: highlight.italic,
    }
}

export const VimHighlightToDefaultScope = {
    Identifier: ["variable.language", "variable.object", "variable.parameter", "variable.other"],
    Function: ["support.function", "entity.name"],
    Constant: ["variable.other.constant", "entity.other"],
}
