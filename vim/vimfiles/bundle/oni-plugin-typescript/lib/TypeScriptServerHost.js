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
var events = require("events");
var os = require("os");
var path = require("path");
var readline = require("readline");
var tssPath = path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsserver.js");
/**
 * End definitions
 */
var TypeScriptServerHost = (function (_super) {
    __extends(TypeScriptServerHost, _super);
    function TypeScriptServerHost() {
        var _this = this;
        _super.call(this);
        this._tssProcess = null;
        this._seqNumber = 0;
        this._seqToPromises = {};
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
        this._tssProcess = childProcess.exec("node " + tssPath, { maxBuffer: 500 * 1024 * 1024 }, function (err) {
            if (err) {
                console.error(err);
            }
        });
        console.log("Process ID: " + this._tssProcess.pid); // tslint:disable-line no-console
        this._rl = readline.createInterface({
            input: this._tssProcess.stdout,
            output: this._tssProcess.stdin,
            terminal: false,
        });
        this._tssProcess.stderr.on("data", function (data, err) {
            console.error("Error from tss: " + data);
        });
        this._tssProcess.on("error", function (data) {
            debugger; // tslint:disable-line no-debugger
        });
        this._tssProcess.on("exit", function (data) {
            debugger; // tslint:disable-line no-debugger
        });
        this._tssProcess.on("close", function (data) {
            debugger; // tslint:disable-line no-debugger
        });
        this._rl.on("line", function (msg) {
            if (msg.indexOf("{") === 0) {
                _this._parseResponse(msg);
            }
        });
    }
    Object.defineProperty(TypeScriptServerHost.prototype, "pid", {
        get: function () {
            return this._tssProcess.pid;
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptServerHost.prototype.openFile = function (file) {
        return this._makeTssRequest("open", {
            file: file,
        });
    };
    TypeScriptServerHost.prototype.getProjectInfo = function (file) {
        return this._makeTssRequest("projectInfo", {
            file: file,
            needFileNameList: true,
        });
    };
    TypeScriptServerHost.prototype.getTypeDefinition = function (file, line, offset) {
        return this._makeTssRequest("typeDefinition", {
            file: file,
            line: line,
            offset: offset,
        });
    };
    TypeScriptServerHost.prototype.getFormattingEdits = function (file, line, offset, endLine, endOffset) {
        return this._makeTssRequest("format", {
            file: file,
            line: line,
            offset: offset,
            endLine: endLine,
            endOffset: endOffset,
        });
    };
    TypeScriptServerHost.prototype.getCompletions = function (file, line, offset, prefix) {
        return this._makeTssRequest("completions", {
            file: file,
            line: line,
            offset: offset,
            prefix: prefix,
        });
    };
    TypeScriptServerHost.prototype.getCompletionDetails = function (file, line, offset, entryNames) {
        return this._makeTssRequest("completionEntryDetails", {
            file: file,
            line: line,
            offset: offset,
            entryNames: entryNames,
        });
    };
    TypeScriptServerHost.prototype.updateFile = function (file, fileContent) {
        return this._makeTssRequest("open", {
            file: file,
            fileContent: fileContent,
        });
    };
    TypeScriptServerHost.prototype.getQuickInfo = function (file, line, offset) {
        return this._makeTssRequest("quickinfo", {
            file: file,
            line: line,
            offset: offset,
        });
    };
    TypeScriptServerHost.prototype.saveTo = function (file, tmpfile) {
        return this._makeTssRequest("saveto", {
            file: file,
            tmpfile: tmpfile,
        });
    };
    TypeScriptServerHost.prototype.getSignatureHelp = function (file, line, offset) {
        return this._makeTssRequest("signatureHelp", {
            file: file,
            line: line,
            offset: offset,
        });
    };
    TypeScriptServerHost.prototype.getErrors = function (fullFilePath) {
        return this._makeTssRequest("geterr", {
            files: [fullFilePath],
        });
    };
    TypeScriptServerHost.prototype.getErrorsAcrossProject = function (fullFilePath) {
        return this._makeTssRequest("geterrForProject", {
            file: fullFilePath,
        });
    };
    TypeScriptServerHost.prototype.getNavigationTree = function (fullFilePath) {
        return this._makeTssRequest("navtree", {
            file: fullFilePath,
        });
    };
    TypeScriptServerHost.prototype.getDocumentHighlights = function (file, line, offset) {
        return this._makeTssRequest("documentHighlights", {
            file: file,
            line: line,
            offset: offset,
        });
    };
    TypeScriptServerHost.prototype._makeTssRequest = function (commandName, args) {
        var seq = this._seqNumber++;
        var payload = {
            seq: seq,
            type: "request",
            command: commandName,
            arguments: args,
        };
        var ret = this._createDeferredPromise();
        this._seqToPromises[seq] = ret;
        // TODO: Handle updates in parallel?
        this._tssProcess.stdin.write(JSON.stringify(payload) + os.EOL);
        return ret.promise;
    };
    TypeScriptServerHost.prototype._parseResponse = function (returnedData) {
        var response = JSON.parse(returnedData);
        var seq = response["request_seq"]; // tslint:disable-line no-string-literal
        var success = response["success"]; // tslint:disable-line no-string-literal
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
            console.log("No sequence number returned."); // tslint:disable-line no-console
            if (response.type && response.type === "event") {
                if (response.event && response.event === "semanticDiag") {
                    this.emit("semanticDiag", response.body);
                }
            }
        }
    };
    TypeScriptServerHost.prototype._createDeferredPromise = function () {
        var resolve;
        var reject;
        var promise = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        return {
            resolve: resolve,
            reject: reject,
            promise: promise,
        };
    };
    return TypeScriptServerHost;
}(events.EventEmitter));
exports.TypeScriptServerHost = TypeScriptServerHost;
//# sourceMappingURL=TypeScriptServerHost.js.map