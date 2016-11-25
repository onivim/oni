/**
 * TypeScriptServerHost.ts
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var childProcess = require("child_process");
var path = require("path");
var readline = require("readline");
var os = require("os");
var events = require("events");
var tssPath = path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsserver.js");
var TypeScriptServerHost = (function (_super) {
    __extends(TypeScriptServerHost, _super);
    function TypeScriptServerHost() {
        var _this = _super.call(this) || this;
        _this._tssProcess = null;
        _this._seqNumber = 0;
        _this._seqToPromises = {};
        // Other tries for creating process:
        // this._tssProcess = childProcess.spawn("node", [tssPath], { stdio: "pipe", detached: true, shell: false });
        // this._tssProcess = childProcess.fork(tssPath, [], { stdio: "pipe "})
        //
        // On Windows, an 'npm' window would show up, so it seems like in this context,
        // exec was the most reliable
        // Note max buffer value - once this exceeded, the process will crash
        // TODO: Reload process, or looking at using the --eventPort option instead
        // This has some info on using eventPort: https://github.com/Microsoft/TypeScript/blob/master/src/server/server.ts
        // which might be more reliable
        // Can create the port using this here: https://github.com/Microsoft/TypeScript/blob/master/src/server/server.ts
        _this._tssProcess = childProcess.exec("node " + tssPath, { maxBuffer: 500 * 1024 * 1024 }, function (err) {
            if (err) {
                console.error(err);
            }
        });
        console.log("Process ID: " + _this._tssProcess.pid);
        _this._rl = readline.createInterface({
            input: _this._tssProcess.stdout,
            output: _this._tssProcess.stdin,
            terminal: false
        });
        _this._tssProcess.stderr.on("data", function (data, err) {
            console.error("Error from tss: " + data);
        });
        _this._tssProcess.on("error", function (data) {
            debugger;
        });
        _this._tssProcess.on("exit", function (data) {
            debugger;
        });
        _this._tssProcess.on("close", function (data) {
            debugger;
        });
        _this._rl.on("line", function (msg) {
            if (msg.indexOf("{") === 0) {
                _this._parseResponse(msg);
            }
        });
        return _this;
    }
    Object.defineProperty(TypeScriptServerHost.prototype, "pid", {
        get: function () {
            return this._tssProcess.pid;
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptServerHost.prototype.openFile = function (fullFilePath) {
        this._makeTssRequest("open", {
            file: fullFilePath
        });
    };
    TypeScriptServerHost.prototype.getProjectInfo = function (fullFilePath) {
        this._makeTssRequest("projectInfo", {
            file: fullFilePath,
            needFileNameList: true
        });
    };
    TypeScriptServerHost.prototype.getTypeDefinition = function (fullFilePath, line, col) {
        return this._makeTssRequest("typeDefinition", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    };
    TypeScriptServerHost.prototype.getFormattingEdits = function (fullFilePath, line, col, endLine, endCol) {
        return this._makeTssRequest("format", {
            file: fullFilePath,
            line: line,
            offset: col,
            endLine: endLine,
            endOffset: endCol
        });
    };
    TypeScriptServerHost.prototype.getCompletions = function (fullFilePath, line, col, prefix) {
        return this._makeTssRequest("completions", {
            file: fullFilePath,
            line: line,
            offset: col,
            prefix: prefix
        });
    };
    TypeScriptServerHost.prototype.getCompletionDetails = function (fullFilePath, line, col, entryNames) {
        return this._makeTssRequest("completionEntryDetails", {
            file: fullFilePath,
            line: line,
            offset: col,
            entryNames: entryNames
        });
    };
    TypeScriptServerHost.prototype.updateFile = function (fullFilePath, updatedContents) {
        return this._makeTssRequest("open", {
            file: fullFilePath,
            fileContent: updatedContents
        });
    };
    TypeScriptServerHost.prototype.getQuickInfo = function (fullFilePath, line, col) {
        return this._makeTssRequest("quickinfo", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    };
    TypeScriptServerHost.prototype.saveTo = function (fullFilePath, tmpFile) {
        return this._makeTssRequest("saveto", {
            file: fullFilePath,
            tmpfile: tmpFile
        });
    };
    TypeScriptServerHost.prototype.getSignatureHelp = function (fullFilePath, line, col) {
        return this._makeTssRequest("signatureHelp", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    };
    TypeScriptServerHost.prototype.getErrors = function (fullFilePath) {
        return this._makeTssRequest("geterr", {
            files: [fullFilePath],
        });
    };
    TypeScriptServerHost.prototype.getErrorsAcrossProject = function (fullFilePath) {
        return this._makeTssRequest("geterrForProject", {
            file: fullFilePath
        });
    };
    TypeScriptServerHost.prototype.getDocumentHighlights = function (fullFilePath, lineNumber, offset) {
        return this._makeTssRequest("documentHighlights", {
            file: fullFilePath,
            line: lineNumber,
            offset: offset
        });
    };
    TypeScriptServerHost.prototype._makeTssRequest = function (commandName, args) {
        var seqNumber = this._seqNumber++;
        var payload = {
            seq: seqNumber,
            type: "request",
            command: commandName,
            arguments: args
        };
        var ret = this._createDeferredPromise();
        this._seqToPromises[seqNumber] = ret;
        // TODO: Handle updates in parallel?
        this._tssProcess.stdin.write(JSON.stringify(payload) + os.EOL);
        return ret.promise;
    };
    TypeScriptServerHost.prototype._parseResponse = function (returnedData) {
        var response = JSON.parse(returnedData);
        var seq = response["request_seq"];
        var success = response["success"];
        if (typeof seq === "number") {
            if (success) {
                this._seqToPromises[seq].resolve(response.body);
            }
            else {
                this._seqToPromises[seq].reject(new Error(response.message));
            }
        }
        else {
            // If a sequence wasn't specified, it might be a call that returns multiple results
            // Like 'geterr' - returns both semanticDiag and syntaxDiag
            console.log("No sequence number returned.");
            if (response.type && response.type === "event") {
                if (response.event && response.event === "semanticDiag") {
                    this.emit("semanticDiag", response.body);
                }
            }
        }
    };
    TypeScriptServerHost.prototype._createDeferredPromise = function () {
        var resolve, reject;
        var promise = new Promise(function () {
            resolve = arguments[0];
            reject = arguments[1];
        });
        return {
            resolve: resolve,
            reject: reject,
            promise: promise
        };
    };
    return TypeScriptServerHost;
}(events.EventEmitter));
exports.TypeScriptServerHost = TypeScriptServerHost;
//# sourceMappingURL=TypeScriptServerHost.js.map