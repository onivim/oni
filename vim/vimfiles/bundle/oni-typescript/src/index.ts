declare var Oni;
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as Promise from "bluebird";
import {TypeScriptServerHost} from "./TypeScriptServerHost"
import {QuickInfo} from "./QuickInfo";

import * as _ from "lodash"

const host = new TypeScriptServerHost();
const quickInfo = new QuickInfo(Oni, host);

let lastOpenFile = null;

let lastBuffer: string[] = []

const getQuickInfo = (textDocumentPosition: Oni.TextDocumentPosition) => {
    return host.getQuickInfo(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
        .then((val: any) => {
            return {
                title: val.displayString,
                description: val.documentation
            }
        })
}

const getDefinition = (textDocumentPosition: Oni.TextDocumentPosition) => {
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

const getCompletionDetails = (textDocumentPosition: Oni.TextDocumentPosition, completionItem) => {
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

const getCompletions = (textDocumentPosition: Oni.TextDocumentPosition) => {
    if(textDocumentPosition.column <= 1)
        return Promise.resolve({
            completions: []
        })

    let currentLine = lastBuffer[textDocumentPosition.line - 1];
    let col = textDocumentPosition.column - 2
    let currentPrefix = "";

    while(col >= 0) {
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
    console.log("Current prefix")

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

Oni.registerLanguageService({
    getQuickInfo: getQuickInfo,
    getDefinition: getDefinition,
    getCompletions: getCompletions,
    getCompletionDetails: getCompletionDetails
})

host.on("semanticDiag", (diagnostics) => {

    const fileName = diagnostics.file

    const diags = diagnostics.diagnostics || []
    
    const errors = diags.map(d => {
        const lineNumber = d.start.line
        let startColumn = null
        let endColumn = null

        if(d.start.line === d.end.line) {
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
}, 250)

const requestErrorUpdate = _.throttle((file) => {
    host.getErrorsAcrossProject(file)
}, 500, { leading: true, trailing: true })

Oni.on("buffer-update", (args) => {

    if(!args.eventContext.bufferFullPath)
        return

    if(lastOpenFile !== args.eventContext.bufferFullPath) {
        host.openFile(args.eventContext.bufferFullPath);
    }

    lastBuffer = args.bufferLines

    updateFile(args.eventContext.bufferFullPath, args.bufferLines.join(os.EOL));

    requestErrorUpdate(args.eventContext.bufferFullPath)
});

export interface DisplayPart {
    text: string;
    kind: string;
}

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
