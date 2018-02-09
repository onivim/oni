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
}

export const vimHighlightToTokenColorStyle = (highlight: IVimHighlight): TokenColorStyle => {
    return {
        foregroundColor: Color(highlight.foreground).hex(),
        backgroundColor: Color(highlight.background).hex(),
        bold: false,
        italic: false,
    }
}

export const VimHighlightToDefaultScope = {
    Identifier: [
        "support.variable",
        "support.variable.property.dom",
        "support.class.dom",
        "support.class.builtin",
        "support.type.primitive",
        "variable.language",
        "variable.parameter",
        "variable.object",
        "meta.object.type",
        "meta.object",
        "variable.other.readwrite",
        "variable.other.readwrite.alias",
    ],
    Function: [
        "support.function",
        "meta.function",
        "meta.function.call",
        "entity.name",
        "entity.name.type",
        "entity.name.function",
        "entity.name.type.enum",
        "entity.name.type.interface",
        "entity.name.type.module",
        "punctuation.accessor",
        "punctuation.separator.continuation",
        "punctuation.separator.comma",
        "punctuation.terminator",
        "punctuation.terminator",
    ],
    Constant: [
        "variable.other",
        "entity.other",
        "keyword.control",
        "storage.type",
        "storage.type.enum",
        "storage.type.interface",
        "keyword.control.import",
        "variable.object",
        "variable.object.property",
        "variable.other.constant",
        "variable.other.object",
        "variable.other.constant.object",
        "variable.other.object.property",
        "variable.other.property",
    ],
}
