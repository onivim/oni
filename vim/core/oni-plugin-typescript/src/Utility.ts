/**
 * Utility.ts
 */

import * as path from "path"

import * as types from "vscode-languageserver-types"

import { CodeEdit, TextSpan } from "typescript/lib/protocol" // tslint:disable-line

import { IDisplayPart } from "./Types"

export const zeroBasedPositionToOneBasedPosition = (zeroBasedPosition: types.Position) => ({
    line: zeroBasedPosition.line + 1,
    character: zeroBasedPosition.character + 1,
})

export const getLanguageFromFileName = (fileName: string) => {
    const extension = path.extname(fileName)
    const language = extension === ".js" || extension === ".jsx" ? "javascript" : "typescript"
    return language
}

export const convertCodeEditToTextEdit = (codeEdit: CodeEdit): types.TextEdit => {
    const range = types.Range.create(
        codeEdit.start.line - 1,
        codeEdit.start.offset - 1,
        codeEdit.end.line - 1,
        codeEdit.end.offset - 1,
    )
    const newText = codeEdit.newText

    return {
        range,
        newText,
    }
}

export const convertToDisplayString = (displayParts: IDisplayPart[]) => {
    let ret = ""

    if (!displayParts || !displayParts.forEach) {
        return ret
    }

    displayParts.forEach(dp => {
        ret += dp.text
    })

    return ret
}

export const convertTypeScriptKindToSymbolKind = (kind: string): types.SymbolKind => {
    switch (kind) {
        case "var":
        case "let":
            return types.SymbolKind.Variable
        case "property":
        case "getter":
            return types.SymbolKind.Property
        case "const":
            return types.SymbolKind.Constant
        case "method":
            return types.SymbolKind.Method
        case "interface":
            return types.SymbolKind.Interface
        case "type":
            return types.SymbolKind.Constructor
        case "class":
            return types.SymbolKind.Class
        case "module":
            return types.SymbolKind.Module
        case "alias":
            return types.SymbolKind.Variable
        case "function":
            return types.SymbolKind.Function
        case "enum member":
            return types.SymbolKind.Enum
        default:
            return types.SymbolKind.Field
    }
}

export const convertTextSpanToRange = (span: TextSpan): types.Range => {
    return types.Range.create(
        span.start.line - 1,
        span.start.offset - 1,
        span.end.line - 1,
        span.end.offset - 1,
    )
}

export const convertTextSpanToLocation = (
    fileUri: string,
    span: protocol.TextSpan,
): types.Location => {
    const range = convertTextSpanToRange(span)
    return types.Location.create(fileUri, range)
}
