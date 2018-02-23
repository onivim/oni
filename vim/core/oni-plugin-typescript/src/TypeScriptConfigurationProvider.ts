/**
 * TypeScriptConfigurationProvider.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { LanguageConnection } from "./LightweightLanguageClient"
import { IDocumentRangeFormattingParams } from "./Types"
import { TypeScriptServerHost } from "./TypeScriptServerHost"
import * as Utility from "./Utility"

interface ICodeActionRequestInfo {
    filePath: string
    range: types.Range
}

let lastCodeActionRequestInfo: ICodeActionRequestInfo = null

export const getCodeActions = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    protocolName: string,
    payload: any,
): Promise<types.Command[]> => {
    const textDocument = payload.textDocument
    const range = payload.range
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)

    const val = await host.getRefactors(
        filePath,
        range.start.line + 1,
        range.start.character + 1,
        range.end.line + 1,
        range.end.character + 1,
    )

    const convertApplicableRefactorToCommand = (
        refactor: protocol.ApplicableRefactorInfo,
    ): types.Command[] => {
        const actions = refactor.actions || []
        return actions.map(action => ({
            title: refactor.description + ": " + action.description,
            command: refactor.name + "|" + action.name,
        }))
    }

    const arrayOfCommandArrays = val.map(refactorInfo =>
        convertApplicableRefactorToCommand(refactorInfo),
    )

    const flattenedCommands: types.Command[] = [].concat(...arrayOfCommandArrays)

    lastCodeActionRequestInfo = {
        filePath,
        range,
    }

    return flattenedCommands
}

export const executeCommand = (
    connection: LanguageConnection,
    oni: Oni.Plugin.Api,
    host: TypeScriptServerHost,
) => async (protocolName: string, payload: any): Promise<any> => {
    const command: string = payload.command
    const args: any[] = payload.args || []

    const language = Utility.getLanguageFromFileName(lastCodeActionRequestInfo.filePath)
    const [refactorName, actionName] = command.split("|")

    const val = await host.getEditsForRefactor(
        refactorName,
        actionName,
        lastCodeActionRequestInfo.filePath,
        lastCodeActionRequestInfo.range.start.line + 1,
        lastCodeActionRequestInfo.range.start.character + 1,
        lastCodeActionRequestInfo.range.end.line + 1,
        lastCodeActionRequestInfo.range.end.character + 1,
    )

    const changes = val.edits.reduce((prev: any, codeEdit: protocol.FileCodeEdits) => {
        const file = oni.language.wrapPathInFileUri(codeEdit.fileName)
        return {
            ...prev,
            [file]: codeEdit.textChanges.map(te => Utility.convertCodeEditToTextEdit(te)),
        } as any
    }, {})

    await connection.request("workspace/applyEdit", language, { edit: { changes } })
}
