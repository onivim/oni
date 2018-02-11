/**
 * TypeScriptServerHost.ts
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as childProcess from "child_process"
import * as events from "events"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import * as readline from "readline"

const tssPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "node_modules",
    "typescript",
    "lib",
    "tsserver.js",
)

export class TypeScriptServerHost extends events.EventEmitter {
    private _tssProcess = null
    private _seqNumber = 0
    private _seqToPromises = {}
    private _rl: any
    private _initPromise: Promise<void>

    private _openedFiles: string[] = []

    public get pid(): number {
        return this._tssProcess.pid
    }

    constructor(Oni: any) {
        super()
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
        this._initPromise = this._startTypescriptServer(Oni)
    }

    public async _startTypescriptServer(Oni): Promise<void> {
        this._tssProcess = await Oni.process.spawnNodeScript(tssPath)
        console.log("Process ID: " + this._tssProcess.pid) // tslint:disable-line no-console

        this._rl = readline.createInterface({
            input: this._tssProcess.stdout,
            output: this._tssProcess.stdin,
            terminal: false,
        })

        this._tssProcess.stderr.on("data", (data, err) => {
            console.warn("Error from tss: " + data) // tslint:disable-line no-console
        })

        this._tssProcess.on("error", data => {
            debugger // tslint:disable-line no-debugger
        })

        this._tssProcess.on("exit", data => {
            debugger // tslint:disable-line no-debugger
        })

        this._tssProcess.on("close", data => {
            debugger // tslint:disable-line no-debugger
        })

        this._rl.on("line", msg => {
            if (msg.indexOf("{") === 0) {
                try {
                    this._parseResponse(msg)
                } catch (e) {
                    // tslint:disable-next-line
                    console.warn(`Error parsing TSS response: ${e}`)
                }
            }
        })
    }

    public async openFile(file: string, text?: string): Promise<any> {
        if (this._openedFiles.indexOf(file) >= 0) {
            return
        }

        this._openedFiles.push(file)

        return this._makeTssRequest("open", {
            file,
            fileContent: text,
        })
    }

    public getProjectInfo(file: string): Promise<any> {
        return this._makeTssRequest("projectInfo", {
            file,
            needFileNameList: true,
        })
    }
    public getDefinition(file: string, line: number, offset: number): Promise<void> {
        return this._makeTssRequest<void>("definition", {
            file,
            line,
            offset,
        })
    }

    public getTypeDefinition(file: string, line: number, offset: number): Promise<void> {
        return this._makeTssRequest<void>("typeDefinition", {
            file,
            line,
            offset,
        })
    }

    public getFormattingEdits(
        file: string,
        line: number,
        offset: number,
        endLine: number,
        endOffset: number,
    ): Promise<protocol.CodeEdit[]> {
        return this._makeTssRequest<protocol.CodeEdit[]>("format", {
            file,
            line,
            offset,
            endLine,
            endOffset,
        })
    }

    public getCompletions(
        file: string,
        line: number,
        offset: number,
        prefix: string,
    ): Promise<any> {
        return this._makeTssRequest<void>("completions", {
            file,
            line,
            offset,
            prefix,
        })
    }

    public getCompletionDetails(
        file: string,
        line: number,
        offset: number,
        entryNames: string[],
    ): Promise<any> {
        return this._makeTssRequest<void>("completionEntryDetails", {
            file,
            line,
            offset,
            entryNames,
        })
    }

    public getRefactors(
        file: string,
        startLine: number,
        startOffset: number,
        endLine: number,
        endOffset: number,
    ): Promise<protocol.ApplicableRefactorInfo[]> {
        return this._makeTssRequest<protocol.ApplicableRefactorInfo[]>("getApplicableRefactors", {
            file,
            startLine,
            startOffset,
            endLine,
            endOffset,
        })
    }

    public getEditsForRefactor(
        refactor: string,
        action: string,
        file: string,
        startLine: number,
        startOffset: number,
        endLine: number,
        endOffset: number,
    ): Promise<protocol.RefactorEditInfo> {
        return this._makeTssRequest<protocol.RefactorEditInfo>("getEditsForRefactor", {
            refactor,
            action,
            file,
            startLine,
            startOffset,
            endLine,
            endOffset,
        })
    }

    public updateFile(file: string, fileContent: string): Promise<void> {
        const totalLines = fileContent.split(os.EOL)
        return this._makeTssRequest<void>("change", {
            file,
            line: 1,
            offset: 1,
            endLine: totalLines.length + 1,
            endOffset: 1,
            insertString: fileContent,
        })
    }

    public changeLineInFile(file: string, line: number, newLineContents: string): Promise<void> {
        return this._makeTssRequest<void>("change", {
            file,
            line,
            offset: 1,
            endOffset: 1,
            endLine: line + 1,
            insertString: newLineContents + os.EOL,
        })
    }

    public getQuickInfo(file: string, line: number, offset: number): Promise<any> {
        return this._makeTssRequest<void>("quickinfo", {
            file,
            line,
            offset,
        })
    }

    public saveTo(file: string, tmpfile: string): Promise<void> {
        return this._makeTssRequest<void>("saveto", {
            file,
            tmpfile,
        })
    }

    public getSignatureHelp(file: string, line: number, offset: number): Promise<any> {
        return this._makeTssRequest<void>("signatureHelp", {
            file,
            line,
            offset,
        })
    }

    public getErrors(fullFilePath: string): Promise<void> {
        return this._makeTssRequest<void>("geterr", {
            files: [fullFilePath],
            delay: 500,
        })
    }

    public getErrorsAcrossProject(fullFilePath: string): Promise<void> {
        return this._makeTssRequest<void>("geterrForProject", {
            file: fullFilePath,
        })
    }

    public getNavigationTree(fullFilePath: string): Promise<protocol.NavigationTree> {
        return this._makeTssRequest<protocol.NavigationTree>("navtree", {
            file: fullFilePath,
        })
    }

    public getDocumentHighlights(file: string, line: number, offset: number): Promise<void> {
        return this._makeTssRequest<void>("documentHighlights", {
            file,
            line,
            offset,
        })
    }

    public findAllReferences(
        file: string,
        line: number,
        offset: number,
    ): Promise<protocol.ReferencesResponseBody> {
        return this._makeTssRequest<protocol.ReferencesResponseBody>("references", {
            file,
            line,
            offset,
        })
    }
    public navTo(file: string, query: string): Promise<protocol.NavtoItem[]> {
        return this._makeTssRequest<protocol.NavtoItem[]>("navto", {
            file,
            searchValue: query,
        })
    }

    public rename(
        file: string,
        line: number,
        offset: number,
    ): Promise<protocol.RenameResponseBody> {
        return this._makeTssRequest<protocol.RenameResponseBody>("rename", {
            file,
            line,
            offset,
            findInComments: false,
            findInStrings: false,
        })
    }

    public async _makeTssRequest<T>(commandName: string, args: any): Promise<T> {
        await this._initPromise
        const seq = this._seqNumber++
        const payload = {
            seq,
            type: "request",
            command: commandName,
            arguments: args,
        }

        const ret = this._createDeferredPromise<T>()
        this._seqToPromises[seq] = ret

        // TODO: Handle updates in parallel?

        this._tssProcess.stdin.write(JSON.stringify(payload) + os.EOL)

        return ret.promise
    }

    private _parseResponse(returnedData: string): void {
        const response = JSON.parse(returnedData)

        const seq = response["request_seq"] // tslint:disable-line no-string-literal
        const success = response["success"] // tslint:disable-line no-string-literal

        if (typeof seq === "number") {
            if (success) {
                this._seqToPromises[seq].resolve(response.body)
            } else {
                this._seqToPromises[seq].reject(new Error(response.message))
            }

            this._seqToPromises[seq] = null
        } else {
            // If a sequence wasn't specified, it might be a call that returns multiple results
            // Like 'geterr' - returns both semanticDiag and syntaxDiag
            if (response.type && response.type === "event") {
                if (response.event && response.event === "semanticDiag") {
                    this.emit("semanticDiag", response.body)
                }
            }
        }
    }

    private _createDeferredPromise<T>(): any {
        let resolve
        let reject
        const promise = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })
        return {
            resolve,
            reject,
            promise,
        }
    }
}
