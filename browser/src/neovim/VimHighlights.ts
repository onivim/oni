/**
 * VimHighlights
 *
 * Mapping of Vim highlight groups to default scopes
 */

import { TokenColorStyle } from "./../Services/TokenColors"

export interface IVimHighlight {
    foreground: string
    background: string
}

export const vimHighlightToTokenColorStyle = (highlight: IVimHighlight): TokenColorStyle => {
    return {
        foregroundColor: highlight.foreground,
        backgroundColor: highlight.background,
        // TODO: Do we get these from `nvim_get_hl_by_name`?
        bold: false,
        italic: false,
    }
}

export const VimHighlightToDefaultScope = {
    Identifier: [
        "support.variable",
        "support.variable.property.dom",
        "variable.language",
        "variable.parameter",
        "variable.object",
        "meta.object.type",
        "meta.object",
    ],
    Function: [
        "support.function",
        "entity.name",
        "entity.name.type.enum",
        "entity.name.type.interface",
        "meta.function.call",
        "meta.function",
        "punctuation.accessor",
        "punctuation.separator.continuation",
        "punctuation.separator.comma",
        "punctuation.terminator",
        "punctuation.terminator",
    ],
    Constant: [
        "storage.type.interface",
        "storage.type.enum",
        "storage.type.interface",
        "entity.other",
        "keyword.control.import",
        "keyword.control",
        "variable.other.constant",
        "variable.other.object",
        "variable.other.property",
    ],
}
