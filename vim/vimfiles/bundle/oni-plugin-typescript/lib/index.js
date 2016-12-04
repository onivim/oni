"use strict";
var _ = require("lodash");
var os = require("os");
var path = require("path");
var QuickInfo_1 = require("./QuickInfo");
var TypeScriptServerHost_1 = require("./TypeScriptServerHost");
var host = new TypeScriptServerHost_1.TypeScriptServerHost();
var quickInfo = new QuickInfo_1.QuickInfo(Oni, host);
var findParentDir = require("find-parent-dir"); // tslint:disable-line no-var-requires
var lastOpenFile = null;
var lastBuffer = [];
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
var getQuickInfo = function (textDocumentPosition) {
    return host.getQuickInfo(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
        .then(function (val) {
        return {
            title: val.displayString,
            description: val.documentation,
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
            column: val.start.offset,
        };
    });
};
var getFormattingEdits = function (position) {
    return host.getFormattingEdits(position.bufferFullPath, 1, 1, lastBuffer.length, 0)
        .then(function (val) {
        var edits = val.map(function (v) {
            var start = {
                line: v.start.line,
                column: v.start.offset,
            };
            var end = {
                line: v.end.line,
                column: v.end.offset,
            };
            return {
                start: start,
                end: end,
                newValue: v.newText,
            };
        });
        return {
            filePath: position.bufferFullPath,
            version: position.version,
            edits: edits,
        };
    });
};
var evaluateBlock = function (context, id, fileName, code) {
    var vm = require("vm");
    var ts = require("typescript");
    // Get all imports from last module
    var commonImports = lastBuffer.filter(function (line) {
        return (line.trim().indexOf("import") === 0 || line.indexOf("require(") >= 0) && line.indexOf("ignore-live") === -1 && line.indexOf("return") === -1;
    });
    code = commonImports.join(os.EOL) + code;
    code = ts.transpileModule(code, { target: "ES6" }).outputText;
    var script = new vm.Script(code);
    var Module = require("module");
    var mod = new Module(fileName);
    var util = require("util");
    var sandbox = {
        module: mod,
        __filename: fileName,
        __dirname: path.dirname(fileName),
        require: function (requirePath) {
            try {
                var path_1 = require("path");
                // See if this is a 'node_modules' dependency:
                var modulePath = findParentDir.sync(__dirname, path_1.join("node_modules", requirePath));
                if (modulePath) {
                    requirePath = path_1.join(modulePath, "node_modules", requirePath);
                }
                return mod.require(requirePath);
            }
            catch (ex) {
                // TODO: Log require error here
                debugger; // tslint:disable-line no-debugger
            }
        },
    };
    var result = script.runInNewContext(sandbox);
    var initialResult = {
        id: id,
        fileName: fileName,
        output: null,
        errors: null,
    };
    if (result.then) {
        return result.then(function (val) { return (_.extend({}, initialResult, {
            result: util.inspect(val),
            variables: util.inspect(sandbox),
        })); }, function (err) { return (_.extend({}, initialResult, {
            variables: util.inspect(sandbox),
            errors: [err],
        })); });
    }
    else {
        return Promise.resolve(_.extend({}, initialResult, {
            result: util.inspect(result),
            variables: util.inspect(sandbox),
        }));
    }
};
var getCompletionDetails = function (textDocumentPosition, completionItem) {
    return host.getCompletionDetails(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, [completionItem.label])
        .then(function (details) {
        var entry = details[0];
        return {
            kind: entry.kind,
            label: entry.name,
            documentation: entry.documentation && entry.documentation.length ? entry.documentation[0].text : null,
            detail: convertToDisplayString(entry.displayParts),
        };
    });
};
var getCompletions = function (textDocumentPosition) {
    if (textDocumentPosition.column <= 1) {
        return Promise.resolve({
            completions: [],
        });
    }
    var currentLine = lastBuffer[textDocumentPosition.line - 1];
    var col = textDocumentPosition.column - 2;
    var currentPrefix = "";
    while (col >= 0) {
        var currentCharacter = currentLine[col];
        if (!currentCharacter.match(/[_a-z]/i)) {
            break;
        }
        currentPrefix = currentCharacter + currentPrefix;
        col--;
    }
    var basePos = col;
    if (currentPrefix.length === 0 && currentLine[basePos] !== ".") {
        return Promise.resolve({
            base: currentPrefix,
            completions: [],
        });
    }
    console.log("Get completions: current line " + currentLine); // tslint:disable-line no-console
    return host.getCompletions(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, currentPrefix)
        .then(function (val) {
        var results = val
            .filter(function (v) { return v.name.indexOf(currentPrefix) === 0 || currentPrefix.length === 0; })
            .map(function (v) { return ({
            label: v.name,
            kind: v.kind,
        }); });
        var ret = [];
        // If there is only one result, and it matches exactly,
        // don't show
        if (results.length === 1 && results[0].label === currentPrefix) {
            ret = [];
        }
        else {
            ret = results;
        }
        return {
            base: currentPrefix,
            completions: results,
        };
    });
};
var getSignatureHelp = function (textDocumentPosition) {
    return host.getSignatureHelp(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column)
        .then(function (result) {
        var items = result.items || [];
        var signatureHelpItems = items.map(function (item) { return ({
            variableArguments: item.isVariadic,
            prefix: convertToDisplayString(item.prefixDisplayParts),
            suffix: convertToDisplayString(item.suffixDisplayParts),
            separator: convertToDisplayString(item.separatorDisplayParts),
            parameters: item.parameters.map(function (p) { return ({
                text: convertToDisplayString(p.displayParts),
                documentation: convertToDisplayString(p.documentation),
            }); }),
        }); });
        return {
            items: signatureHelpItems,
            selectedItemIndex: result.selectedItemIndex,
            argumentCount: result.argumentCount,
            argumentIndex: result.argumentIndex,
        };
    });
};
Oni.registerLanguageService({
    evaluateBlock: evaluateBlock,
    getCompletionDetails: getCompletionDetails,
    getCompletions: getCompletions,
    getDefinition: getDefinition,
    getFormattingEdits: getFormattingEdits,
    getQuickInfo: getQuickInfo,
    getSignatureHelp: getSignatureHelp,
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
            endColumn: endColumn,
        };
    });
    Oni.diagnostics.setErrors("typescript-compiler", fileName, errors, "red");
});
var updateFile = _.throttle(function (bufferFullPath, stringContents) {
    host.updateFile(bufferFullPath, stringContents);
}, 50);
Oni.on("buffer-update", function (args) {
    if (!args.eventContext.bufferFullPath) {
        return;
    }
    if (lastOpenFile !== args.eventContext.bufferFullPath) {
        host.openFile(args.eventContext.bufferFullPath);
    }
    lastBuffer = args.bufferLines;
    updateFile(args.eventContext.bufferFullPath, args.bufferLines.join(os.EOL));
});
var getHighlightsFromNavTree = function (navTree, highlights) {
    if (!navTree) {
        return;
    }
    navTree.forEach(function (item) {
        var spans = item.spans;
        var highlightKind = kindToHighlightGroup[item.kind];
        // if(!highlightKind)
        //     debugger
        spans.forEach(function (s) {
            highlights.push({
                highlightKind: highlightKind,
                start: { line: s.start.line, column: s.start.offset },
                end: { line: s.end.line, column: s.end.offset },
                token: item.text,
            });
        });
        if (item.childItems) {
            getHighlightsFromNavTree(item.childItems, highlights);
        }
    });
};
Oni.on("buffer-enter", function (args) {
    // // TODO: Look at alternate implementation for this
    host.openFile(args.bufferFullPath);
    host.getNavigationTree(args.bufferFullPath)
        .then(function (navTree) {
        var highlights = [];
        // debugger
        getHighlightsFromNavTree(navTree.childItems, highlights);
        Oni.setHighlights(args.bufferFullPath, "derp", highlights);
    });
});
Oni.on("buffer-saved", function (args) {
    host.getErrorsAcrossProject(args.bufferFullPath);
    host.getNavigationTree(args.bufferFullPath)
        .then(function (navTree) {
        var highlights = [];
        // debugger
        getHighlightsFromNavTree(navTree.childItems, highlights);
        Oni.setHighlights(args.bufferFullPath, "derp", highlights);
    });
});
var kindToHighlightGroup = {
    let: "Identifier",
    const: "Constant",
    var: "Identifier",
    alias: "Include",
    function: "Macro",
    method: "Function",
    property: "Special",
    class: "Type",
    interface: "Type",
};
// TODO: Refactor to separate file
var convertToDisplayString = function (displayParts) {
    var ret = "";
    if (!displayParts || !displayParts.forEach) {
        return ret;
    }
    displayParts.forEach(function (dp) {
        ret += dp.text;
    });
    return ret;
};
//# sourceMappingURL=index.js.map