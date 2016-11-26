
/**
 * TypeScriptServerHost.ts
 */

import childProcess = require("child_process");
import fs = require("fs");
import path = require("path");
import readline = require("readline");
import os = require("os");

import * as events from "events";

var tssPath = path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsserver.js");

/**
 * Taken from definitions here:
 * https://github.com/Microsoft/TypeScript/blob/master/lib/protocol.d.ts#L5
 */
export interface TextSpan {
    start: Location
    end: Location
}

export interface Location {
    line: number
    offset: number
}

export interface NavigationTree {
    text: string
    kind: string
    kindModifiers: string
    spans: TextSpan[]
    childItems?: NavigationTree[]
}

/**
 * End definitions
 */



export class TypeScriptServerHost extends events.EventEmitter {

    private _tssProcess = null;
    private _seqNumber = 0;
    private _seqToPromises = {};
    private _rl: any;

    public get pid(): number {
        return this._tssProcess.pid;
    }

    constructor() {
        super();

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
        this._tssProcess = childProcess.exec("node " + tssPath, { maxBuffer: 500*1024*1024 }, (err) => {
            if(err) {
                console.error(err)
            }
        });
        console.log("Process ID: " + this._tssProcess.pid);

        this._rl = readline.createInterface({
            input: this._tssProcess.stdout,
            output: this._tssProcess.stdin,
            terminal: false
        });

        this._tssProcess.stderr.on("data", (data, err) => {
            console.error("Error from tss: " + data);
        });

        this._tssProcess.on("error", (data) => {
            debugger;
        });

        this._tssProcess.on("exit", (data) => {
            debugger
        })

        this._tssProcess.on("close", (data) => {
            debugger;
        })

        this._rl.on("line", (msg) => {
            if (msg.indexOf("{") === 0) {
                this._parseResponse(msg);
            }
        });
    }

    public openFile(fullFilePath: string): Promise<any> {
        return this._makeTssRequest("open", {
            file: fullFilePath
        });
    }

    public getProjectInfo(fullFilePath: string): Promise<any> {
        return this._makeTssRequest("projectInfo", {
            file: fullFilePath,
            needFileNameList: true
        });
    }

    public getTypeDefinition(fullFilePath: string, line: number, col: number): Promise<void> {
        return this._makeTssRequest<void>("typeDefinition", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    }

    public getFormattingEdits(fullFilePath: string, line: number, col: number, endLine: number, endCol: number): Promise<any> {
        return this._makeTssRequest<void>("format", {
            file: fullFilePath,
            line: line,
            offset: col,
            endLine: endLine,
            endOffset: endCol
        })
    }

    public getCompletions(fullFilePath: string, line: number, col: number, prefix: string): Promise<any> {
        return this._makeTssRequest<void>("completions", {
            file: fullFilePath,
            line: line,
            offset: col,
            prefix: prefix
        });
    }

    public getCompletionDetails(fullFilePath: string, line: number, col: number, entryNames: string[]): Promise<any> {
        return this._makeTssRequest<void>("completionEntryDetails", {
            file: fullFilePath,
            line: line,
            offset: col,
            entryNames: entryNames
        });
    }

    public updateFile(fullFilePath: string, updatedContents: string): Promise<void> {
        return this._makeTssRequest<void>("open", {
            file: fullFilePath,
            fileContent: updatedContents
        });
    }

    public getQuickInfo(fullFilePath: string, line: number, col: number): Promise<void> {
        return this._makeTssRequest<void>("quickinfo", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    }

    public saveTo(fullFilePath: string, tmpFile: string): Promise<void> {
        return this._makeTssRequest<void>("saveto", {
            file: fullFilePath,
            tmpfile: tmpFile
        });
    }

    public getSignatureHelp(fullFilePath: string, line: number, col: number): Promise<any> {
        return this._makeTssRequest<void>("signatureHelp", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    }

    public getErrors(fullFilePath: string): Promise<void> {
        return this._makeTssRequest<void>("geterr", {
            files: [fullFilePath],
        });
    }

    public getErrorsAcrossProject(fullFilePath: string): Promise<void> {
        return this._makeTssRequest<void>("geterrForProject", {
            file: fullFilePath
        });
    }

    public getNavigationTree(fullFilePath: string): Promise<NavigationTree> {
        return this._makeTssRequest<NavigationTree>("navtree", {
            file: fullFilePath
        });
    }

    public getDocumentHighlights(fullFilePath: string, lineNumber: number, offset: number): Promise<void> {
        return this._makeTssRequest<void>("documentHighlights", {
            file: fullFilePath,
            line: lineNumber,
            offset: offset
        });
    }

   public _makeTssRequest<T>(commandName: string, args: any): Promise<T> {
        var seqNumber = this._seqNumber++;
        var payload = {
            seq: seqNumber,
            type: "request",
            command: commandName,
            arguments: args
        };

        var ret = this._createDeferredPromise<T>();
        this._seqToPromises[seqNumber] = ret;

        // TODO: Handle updates in parallel?

        this._tssProcess.stdin.write(JSON.stringify(payload) + os.EOL);

        return ret.promise;
    }

    private _parseResponse(returnedData: string): void {
        var response = JSON.parse(returnedData);

        var seq = response["request_seq"];
        var success = response["success"];

        if (typeof seq === "number") {
            if (success) {
                this._seqToPromises[seq].resolve(response.body);
            } else {
                this._seqToPromises[seq].reject(new Error(response.message));
            }
        } else {
            // If a sequence wasn't specified, it might be a call that returns multiple results
            // Like 'geterr' - returns both semanticDiag and syntaxDiag
            console.log("No sequence number returned.")

            if(response.type && response.type === "event") {
                if(response.event && response.event === "semanticDiag") {
                    this.emit("semanticDiag", response.body);
                }
            }
        }
    }

    private _createDeferredPromise<T>(): any {
        var resolve, reject;
        var promise = new Promise(function() {
            resolve = arguments[0];
            reject = arguments[1];
        });
        return {
            resolve: resolve,
            reject: reject,
            promise: promise
        };
    }

}
