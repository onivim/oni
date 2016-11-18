"use strict";
var os = require("os");
var Promise = require("bluebird");
var TypeScriptServerHost_1 = require("./TypeScriptServerHost");
var QuickInfo_1 = require("./QuickInfo");
var _ = require("lodash");
var host = new TypeScriptServerHost_1.TypeScriptServerHost();
var quickInfo = new QuickInfo_1.QuickInfo(Oni, host);
var lastOpenFile = null;
var lastBuffer = [];
var getQuickInfo = function (textDocumentPosition) {
    return host.getQuickInfo(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
        .then(function (val) {
        return {
            title: val.displayString,
            description: val.documentation
        };
    });
};
var getDefinition = function (textDocumentPosition) {
    return host.getTypeDefinition(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
        .then(function (val) {
        val = val[0];
        return {
            filePath: val.file,
            line: val.start.line,
            column: val.start.offset
        };
    });
};
var getCompletionDetails = function (textDocumentPosition, completionItem) {
    return host.getCompletionDetails(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, [completionItem.label])
        .then(function (details) {
        var entry = details[0];
        return {
            kind: entry.kind,
            label: entry.name,
            documentation: entry.documentation && entry.documentation.length ? entry.documentation[0].text : null,
            detail: convertToDisplayString(entry.displayParts)
        };
    });
};
var getCompletions = function (textDocumentPosition) {
    if (textDocumentPosition.column <= 1)
        return Promise.resolve({
            completions: []
        });
    var currentLine = lastBuffer[textDocumentPosition.line - 1];
    var col = textDocumentPosition.column - 2;
    var currentPrefix = "";
    while (col >= 0) {
        var currentCharacter = currentLine[col];
        if (!currentCharacter.match(/[_a-z]/i))
            break;
        currentPrefix = currentCharacter + currentPrefix;
        col--;
    }
    var basePos = col;
    if (currentPrefix.length === 0 && currentLine[basePos] !== ".")
        return Promise.resolve({
            base: currentPrefix,
            completions: []
        });
    console.log("Get completions: current line " + currentLine);
    console.log("Current prefix");
    return host.getCompletions(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, currentPrefix)
        .then(function (val) {
        var results = val
            .filter(function (v) { return v.name.indexOf(currentPrefix) === 0 || currentPrefix.length === 0; })
            .map(function (v) { return ({
            label: v.name,
            kind: v.kind
        }); });
        var ret = [];
        // If there is only one result, and it matches exactly,
        // don't show
        if (results.length === 1 && results[0].label === currentPrefix)
            ret = [];
        else
            ret = results;
        return {
            base: currentPrefix,
            completions: results
        };
    });
};
Oni.registerLanguageService({
    getQuickInfo: getQuickInfo,
    getDefinition: getDefinition,
    getCompletions: getCompletions,
    getCompletionDetails: getCompletionDetails
});
host.on("semanticDiag", function (diagnostics) {
    var fileName = diagnostics.file;
    var diags = diagnostics.diagnostics || [];
    var errors = diags.map(function (d) {
        var lineNumber = d.start.line;
        var startColumn = null;
        var endColumn = null;
        if (d.start.line === d.end.line) {
            startColumn = d.start.offset;
            endColumn = d.end.offset;
        }
        return {
            type: null,
            text: d.text,
            lineNumber: lineNumber,
            startColumn: startColumn,
            endColumn: endColumn
        };
    });
    Oni.diagnostics.setErrors("typescript-compiler", fileName, errors, "red");
});
var updateFile = _.throttle(function (bufferFullPath, stringContents) {
    host.updateFile(bufferFullPath, stringContents);
}, 250);
var requestErrorUpdate = _.throttle(function (file) {
    host.getErrorsAcrossProject(file);
}, 500, { leading: true, trailing: true });
Oni.on("buffer-update", function (args) {
    if (!args.eventContext.bufferFullPath)
        return;
    if (lastOpenFile !== args.eventContext.bufferFullPath) {
        host.openFile(args.eventContext.bufferFullPath);
    }
    lastBuffer = args.bufferLines;
    updateFile(args.eventContext.bufferFullPath, args.bufferLines.join(os.EOL));
    requestErrorUpdate(args.eventContext.bufferFullPath);
});
// TODO: Refactor to separate file
var convertToDisplayString = function (displayParts) {
    var ret = "";
    if (!displayParts || !displayParts.forEach)
        return ret;
    displayParts.forEach(function (dp) {
        ret += dp.text;
    });
    return ret;
};
//# sourceMappingURL=index.js.map