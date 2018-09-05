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

const setFontStyle = (highlight: IVimHighlight) => {
    switch (true) {
        case highlight.bold && !highlight.italic:
            return "bold"
        case !highlight.bold && highlight.italic:
            return "italic"
        case highlight.bold && highlight.italic:
            return "bold italic"
        case !highlight.bold && !highlight.italic:
        default:
            return null
    }
}

export const vimHighlightToTokenColorStyle = (highlight: IVimHighlight): TokenColorStyle => {
    return {
        foreground: Color(highlight.foreground).hex(),
        background: Color(highlight.background).hex(),
        fontStyle: setFontStyle(highlight),
    }
}

export const VimHighlightToDefaultScope = {
    Identifier: ["variable.language", "variable.object", "variable.parameter", "variable.other"],
    Function: ["support.function", "entity.name"],
    Constant: ["variable.other.constant", "entity.other"],
    String: ["string.quoted.double", "string.quoted.single", "string.quoted.triple"],
}
