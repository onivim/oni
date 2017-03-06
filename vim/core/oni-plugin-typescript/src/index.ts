/**
 * index.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../definitions/Oni.d.ts" />
/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as _ from "lodash"

import { evaluateBlock, getCommonImports } from "./LiveEvaluation"
import { QuickInfo } from "./QuickInfo"
import { TypeScriptServerHost } from "./TypeScriptServerHost"

export interface IDisplayPart {
    text: string
    kind: string
}

export const activate = (Oni) => {

    const host = new TypeScriptServerHost()
    const quickInfo = new QuickInfo(Oni, host)

    const lastOpenFile = null

    let lastBuffer: string[] = []

    // Testing Live evaluation
    //
    // Simple case
    // 1+2+3

    // Requiring node modules + absolute paths
    //
    // var path = require("path")
    // var derp = require(path.join(__dirname, "..", "lib", "TypeScriptServerHost"))
    // var object = new derp.TypeScriptServerHost()
    // object.openFile("D:/oni/browser/src/NeovimInstance.ts")
    // object.getNavTree("D:/oni/browser/src/NeovimInstance.ts", 10, 1)
    // object.getCompletions("D:/oni/browser/src/NeovimInstance.ts", 10, 1)

    const getQuickInfo = (textDocumentPosition: Oni.EventContext) => {
        return host.getQuickInfo(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
            .then((val: any) => {
                return {
                    title: val.displayString,
                    description: val.documentation,
                }
            })
    }

    const findAllReferences = (textDocumentPosition: Oni.EventContext) => {
        return host.findAllReferences(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
            .then((val: protocol.ReferencesResponseBody) => {

                const mapResponseToItem = (referenceItem: protocol.ReferencesResponseItem) => ({
                    fullPath: referenceItem.file,
                    line: referenceItem.start.line,
                    column: referenceItem.start.offset,
                    lineText: referenceItem.lineText,
                })

                const output: Oni.Plugin.ReferencesResult = {
                    tokenName: val.symbolName,
                    items: val.refs.map((item) => mapResponseToItem(item)),
                }

                return output
            })
    }

    const getDefinition = (textDocumentPosition: Oni.EventContext) => {
        return host.getTypeDefinition(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
            .then((val: any) => {
                val = val[0]
                return {
                    filePath: val.file,
                    line: val.start.line,
                    column: val.start.offset,
                }
            })
    }

    const getFormattingEdits = (position: Oni.EventContext) => {
        return host.getFormattingEdits(position.bufferFullPath, 1, 1, lastBuffer.length, 0)
            .then((val) => {
                const edits = val.map((v) => {
                    const start = {
                        line: v.start.line,
                        column: v.start.offset,
                    }

                    const end = {
                        line: v.end.line,
                        column: v.end.offset,
                    }

                    return {
                        start,
                        end,
                        newValue: v.newText,
                    }

                })

                return {
                    filePath: position.bufferFullPath,
                    version: position.version,
                    edits,
                }
            })
    }

    const liveEvaluation = (context: Oni.EventContext, id: string, fileName: string, code: string) => {

        const commonImports = getCommonImports(lastBuffer)

        code = commonImports.join(os.EOL) + code

        return evaluateBlock(id, fileName, code)
    }

    const getCompletionDetails = (textDocumentPosition: Oni.EventContext, completionItem) => {

        if (!textDocumentPosition || !textDocumentPosition.bufferFullPath) {
            return Promise.resolve(null)
        }

        return host.getCompletionDetails(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, [completionItem.label])
            .then((details) => {
                const entry = details[0]

                if (!entry) {
                    return null
                }

                return {
                    kind: entry.kind,
                    label: entry.name,
                    documentation: entry.documentation && entry.documentation.length ? entry.documentation[0].text : null,
                    detail: convertToDisplayString(entry.displayParts),
                }
            })
    }

    const getCompletions = (textDocumentPosition: Oni.EventContext) => {
        if (textDocumentPosition.column <= 1) {
            return Promise.resolve({
                completions: [],
            })
        }

        const currentLine = lastBuffer[textDocumentPosition.line - 1]
        let col = textDocumentPosition.column - 2
        let currentPrefix = ""

        while (col >= 0) {
            const currentCharacter = currentLine[col]

            if (!currentCharacter.match(/[_a-z]/i)) {
                break
            }

            currentPrefix = currentCharacter + currentPrefix
            col--
        }

        const basePos = col

        if (currentPrefix.length === 0 && currentLine[basePos] !== ".") {
            return Promise.resolve({
                base: currentPrefix,
                completions: [],
            })
        }

        console.log("Get completions: current line " + currentLine) // tslint:disable-line no-console

        return host.getCompletions(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, currentPrefix)
            .then((val: any[]) => {

                const results = val
                    .filter((v) => v.name.indexOf(currentPrefix) === 0 || currentPrefix.length === 0)
                    .map((v) => ({
                        label: v.name,
                        kind: v.kind,
                    }))

                let ret = []

                // If there is only one result, and it matches exactly,
                // don't show
                if (results.length === 1 && results[0].label === currentPrefix) {
                    ret = []
                } else {
                    ret = results
                }

                return {
                    base: currentPrefix,
                    completions: results,
                }
            })
    }

    const getSignatureHelp = (textDocumentPosition: Oni.EventContext) => {
        return host.getSignatureHelp(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
            .then((result) => {
                const items = result.items || []

                const signatureHelpItems = items.map((item) => ({
                    variableArguments: item.isVariadic,
                    prefix: convertToDisplayString(item.prefixDisplayParts),
                    suffix: convertToDisplayString(item.suffixDisplayParts),
                    separator: convertToDisplayString(item.separatorDisplayParts),
                    parameters: item.parameters.map((p) => ({
                        text: convertToDisplayString(p.displayParts),
                        documentation: convertToDisplayString(p.documentation),
                    })),
                }))

                return {
                    items: signatureHelpItems,
                    selectedItemIndex: result.selectedItemIndex,
                    argumentCount: result.argumentCount,
                    argumentIndex: result.argumentIndex,
                }
            })
    }

    Oni.registerLanguageService({
        evaluateBlock: liveEvaluation,
        findAllReferences,
        getCompletionDetails,
        getCompletions,
        getDefinition,
        getFormattingEdits,
        getQuickInfo,
        getSignatureHelp,
    })

    host.on("semanticDiag", (diagnostics) => {

        const fileName = diagnostics.file

        const diags = diagnostics.diagnostics || []

        const errors = diags.map((d) => {
            const lineNumber = d.start.line
            let startColumn = null
            let endColumn = null

            if (d.start.line === d.end.line) {
                startColumn = d.start.offset
                endColumn = d.end.offset
            }

            return {
                type: null,
                text: d.text,
                lineNumber,
                startColumn,
                endColumn,
            }
        })

        Oni.diagnostics.setErrors("typescript-compiler", fileName, errors, "red")
    })

    const updateFile = _.throttle((bufferFullPath, stringContents) => {
        host.updateFile(bufferFullPath, stringContents)
    }, 50)

    Oni.on("buffer-update", (args) => {

        if (!args.eventContext.bufferFullPath) {
            return
        }

        if (lastOpenFile !== args.eventContext.bufferFullPath) {
            host.openFile(args.eventContext.bufferFullPath)
        }

        lastBuffer = args.bufferLines

        updateFile(args.eventContext.bufferFullPath, args.bufferLines.join(os.EOL))

    })

    Oni.on("buffer-update-incremental", (args) => {
        if (!args.eventContext.bufferFullPath) {
            return
        }

        const changedLine = args.bufferLine
        const lineNumber = args.lineNumber

        lastBuffer[lineNumber - 1] = changedLine

        host.changeLineInFile(args.eventContext.bufferFullPath, lineNumber, changedLine)
    })

    const getHighlightsFromNavTree = (navTree: protocol.NavigationTree[], highlights: any[]) => {
        if (!navTree) {
            return
        }

        navTree.forEach((item) => {
            const spans = item.spans
            const highlightKind = kindToHighlightGroup[item.kind]

            // if(!highlightKind)
            //     debugger

            spans.forEach((s) => {
                highlights.push({
                    highlightKind,
                    start: { line: s.start.line, column: s.start.offset },
                    end: { line: s.end.line, column: s.end.offset },
                    token: item.text,
                })
            })

            if (item.childItems) {
                getHighlightsFromNavTree(item.childItems, highlights)
            }
        })
    }

    Oni.on("buffer-enter", (args: Oni.EventContext) => {
        // // TODO: Look at alternate implementation for this
        host.openFile(args.bufferFullPath)

        host.getNavigationTree(args.bufferFullPath)
            .then((navTree) => {
                const highlights = []
                // debugger
                getHighlightsFromNavTree(navTree.childItems, highlights)

                Oni.setHighlights(args.bufferFullPath, "derp", highlights)
            })
    })

    Oni.on("buffer-saved", (args: Oni.EventContext) => {
        host.getErrorsAcrossProject(args.bufferFullPath)

        host.getNavigationTree(args.bufferFullPath)
            .then((navTree) => {
                const highlights = []
                // debugger
                getHighlightsFromNavTree(navTree.childItems, highlights)

                Oni.setHighlights(args.bufferFullPath, "derp", highlights)
            })
    })

    const kindToHighlightGroup = {
        let: "Identifier",
        const: "Constant",
        var: "Identifier",
        alias: "Include",
        function: "Macro",
        method: "Function",
        property: "Special",
        class: "Type",
        interface: "Type",
    }

    // TODO: Refactor to separate file
    const convertToDisplayString = (displayParts: IDisplayPart[]) => {
        let ret = ""

        if (!displayParts || !displayParts.forEach) {
            return ret
        }

        displayParts.forEach((dp) => {
            ret += dp.text
        })

        return ret
    }
}
