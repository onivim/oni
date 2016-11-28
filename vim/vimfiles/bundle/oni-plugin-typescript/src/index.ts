declare var Oni
import * as path from "path"
import * as fs from "fs"
import * as os from "os"

import { NavigationTree, TypeScriptServerHost } from "./TypeScriptServerHost"
import { QuickInfo } from "./QuickInfo";

import * as _ from "lodash"

const host = new TypeScriptServerHost();
const quickInfo = new QuickInfo(Oni, host);

let lastOpenFile = null;

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
                description: val.documentation
            }
        })
}

const getDefinition = (textDocumentPosition: Oni.EventContext) => {
    return host.getTypeDefinition(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
        .then((val: any) => {
            val = val[0];
            return {
                filePath: val.file,
                line: val.start.line,
                column: val.start.offset
            }
        })
}

const getFormattingEdits = (position: Oni.EventContext) => {
    return host.getFormattingEdits(position.bufferFullPath, 1, 1, lastBuffer.length, 0)
        .then((val) => {
            const edits = val.map(v => {
                const start = {
                    line: v.start.line,
                    column: v.start.offset
                }

                const end = {
                    line: v.end.line,
                    column: v.end.offset
                }

                return {
                    start: start,
                    end: end,
                    newValue: v.newText
                }

            })

            return {
                filePath: position.bufferFullPath,
                version: position.version,
                edits: edits
            }
        })
}

const evaluateBlock = (context: Oni.EventContext, code: string, line: number) => {
    const vm = require("vm")
    const ts = require("typescript")

    // Get all imports from last module

    const commonImports = lastBuffer.filter(line => {
        return (line.trim().indexOf("import") === 0 || line.indexOf("require(") >= 0) && line.indexOf("ignore-live") === -1 && line.indexOf("return") === -1
    })

    code = commonImports.join(os.EOL) + code

    code = ts.transpileModule(code, { target: "ES6" }).outputText

    const script = new vm.Script(code)
    const fileName = context.bufferFullPath
    var Module = require("module")
    const mod = new Module(fileName)
    const util = require("util")
    const sandbox = {
        module: mod,
        __filename: fileName,
        __dirname: path.dirname(fileName),
        require: (path) => {
            try {
                return mod.require(path)
            } catch (ex) {
                // TODO: Log require error here
            }
        }
    }

    const result = script.runInNewContext(sandbox)

    if (result.then) {
        return result.then((val) => ({
            line: line,
            result: util.inspect(val),
            variables: util.inspect(sandbox),
            output: null,
            errors: null
        }), (err) => ({
            line: line,
            result: null,
            variables: util.inspect(sandbox),
            output: null,
            errors: [err]
        }))
    } else {
        return Promise.resolve({
            line: line,
            result: util.inspect(result),
            variables: util.inspect(sandbox),
            output: null,
            errors: null
        })
    }
}

const getCompletionDetails = (textDocumentPosition: Oni.EventContext, completionItem) => {
    return host.getCompletionDetails(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, [completionItem.label])
        .then((details) => {
            const entry = details[0]
            return {
                kind: entry.kind,
                label: entry.name,
                documentation: entry.documentation && entry.documentation.length ? entry.documentation[0].text : null,
                detail: convertToDisplayString(entry.displayParts)
            }
        })
}

const getCompletions = (textDocumentPosition: Oni.EventContext) => {
    if (textDocumentPosition.column <= 1)
        return Promise.resolve({
            completions: []
        })

    let currentLine = lastBuffer[textDocumentPosition.line - 1];
    let col = textDocumentPosition.column - 2
    let currentPrefix = "";

    while (col >= 0) {
        const currentCharacter = currentLine[col]

        if (!currentCharacter.match(/[_a-z]/i))
            break

        currentPrefix = currentCharacter + currentPrefix
        col--
    }

    const basePos = col;


    if (currentPrefix.length === 0 && currentLine[basePos] !== ".")
        return Promise.resolve({
            base: currentPrefix,
            completions: []
        })

    console.log("Get completions: current line " + currentLine)

    return host.getCompletions(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, currentPrefix)
        .then((val: any[]) => {

            const results = val
                .filter(v => v.name.indexOf(currentPrefix) === 0 || currentPrefix.length === 0)
                .map(v => ({
                    label: v.name,
                    kind: v.kind
                }))

            let ret = [];

            // If there is only one result, and it matches exactly,
            // don't show
            if (results.length === 1 && results[0].label === currentPrefix)
                ret = [];
            else
                ret = results

            return {
                base: currentPrefix,
                completions: results
            }
        });
}


const getSignatureHelp = (textDocumentPosition: Oni.EventContext) => {
    return host.getSignatureHelp(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
        .then((result) => {
            const items = result.items || []

            const signatureHelpItems = items.map(item => ({
                variableArguments: item.isVariadic,
                prefix: convertToDisplayString(item.prefixDisplayParts),
                suffix: convertToDisplayString(item.suffixDisplayParts),
                separator: convertToDisplayString(item.separatorDisplayParts),
                parameters: item.parameters.map(p => ({
                    text: convertToDisplayString(p.displayParts),
                    documentation: convertToDisplayString(p.documentation)
                }))
            }))

            return {
                items: signatureHelpItems,
                selectedItemIndex: result.selectedItemIndex,
                argumentCount: result.argumentCount,
                argumentIndex: result.argumentIndex
            }
        })
}


Oni.registerLanguageService({
    getQuickInfo: getQuickInfo,
    getDefinition: getDefinition,
    getCompletions: getCompletions,
    getCompletionDetails: getCompletionDetails,
    getFormattingEdits: getFormattingEdits,
    evaluateBlock: evaluateBlock,
    getSignatureHelp: getSignatureHelp
})

host.on("semanticDiag", (diagnostics) => {

    const fileName = diagnostics.file

    const diags = diagnostics.diagnostics || []

    const errors = diags.map(d => {
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
            lineNumber: lineNumber,
            startColumn: startColumn,
            endColumn: endColumn
        }
    })

    Oni.diagnostics.setErrors("typescript-compiler", fileName, errors, "red")
})


const updateFile = _.throttle((bufferFullPath, stringContents) => {
    host.updateFile(bufferFullPath, stringContents)
}, 50)

Oni.on("buffer-update", (args) => {

    if (!args.eventContext.bufferFullPath)
        return

    if (lastOpenFile !== args.eventContext.bufferFullPath) {
        host.openFile(args.eventContext.bufferFullPath);
    }

    lastBuffer = args.bufferLines

    updateFile(args.eventContext.bufferFullPath, args.bufferLines.join(os.EOL));

});


const getHighlightsFromNavTree = (navTree: NavigationTree[], highlights: any[]) => {
    if (!navTree)
        return

    navTree.forEach((item) => {
        const spans = item.spans
        const highlightKind = kindToHighlightGroup[item.kind]

        // if(!highlightKind)
        //     debugger

        spans.forEach((s) => {
            highlights.push({
                highlightKind: highlightKind,
                start: { line: s.start.line, column: s.start.offset },
                end: { line: s.end.line, column: s.end.offset },
                token: item.text
            })
        })

        if (item.childItems)
            getHighlightsFromNavTree(item.childItems, highlights)
    })
}

Oni.on("buffer-enter", (args: Oni.EventContext) => {
    // // TODO: Look at alternate implementation for this
    host.openFile(args.bufferFullPath);

    host.getNavigationTree(args.bufferFullPath)
        .then(navTree => {
            const highlights = []
            // debugger
            getHighlightsFromNavTree(navTree.childItems, highlights)

            Oni.setHighlights(args.bufferFullPath, "derp", highlights)
        })
})

Oni.on("buffer-saved", (args: Oni.EventContext) => {
    host.getErrorsAcrossProject(args.bufferFullPath)

    host.getNavigationTree(args.bufferFullPath)
        .then(navTree => {
            const highlights = []
            // debugger
            getHighlightsFromNavTree(navTree.childItems, highlights)

            Oni.setHighlights(args.bufferFullPath, "derp", highlights)
        })
})

export interface DisplayPart {
    text: string;
    kind: string;
}

var kindToHighlightGroup = {
    let: "Identifier",
    const: "Constant",
    var: "Identifier",
    alias: "Include",
    function: "Macro",
    method: "Function",
    property: "Special",
    class: "Type",
    interface: "Type"
};

// TODO: Refactor to separate file
const convertToDisplayString = (displayParts: DisplayPart[]) => {
    let ret = "";

    if (!displayParts || !displayParts.forEach)
        return ret;

    displayParts.forEach((dp) => {
        ret += dp.text;
    });

    return ret;
}
