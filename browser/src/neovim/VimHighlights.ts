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
    Identifier: [
        "support.variable",
        "support.variable.property.dom",
        "support.class.dom",
        "support.class.builtin",
        "support.type.primitive",
        "variable.language",
        "variable.language.this",
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
        "entity.name.type.alias",
        "entity.name.type.class",
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
        "constant.language",
        "variable.other",
        "entity.other",
        "keyword.package",
        "keyword.var",
        "keyword.struct",
        "keyword.control",
        "keyword.function",
        "keyword.operator",
        "keyword.operator.expression",
        "keyword.operator.expression.void",
        "keyword.control.import",
        "storage.type",
        "storage.type.type",
        "storage.type.class",
        "storage.type.enum",
        "storage.type.string",
        "storage.type.interface",
        "keyword.control.import",
        "variable.object",
        "variable.object.property",
        "variable.other.constant",
        "variable.other.object",
        "variable.other.assignment",
        "variable.other.constant.object",
        "variable.other.object.property",
        "variable.other.property",
    ],
    String: ["string.quoted.double", "string.quoted.single", "string.quoted.triple"],
}
