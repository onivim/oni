/// <reference types="node" />
/// <reference types="es6-promise" />
import * as events from "events";
export declare class TypeScriptServerHost extends events.EventEmitter {
    private _tssProcess;
    private _seqNumber;
    private _seqToPromises;
    private _rl;
    readonly pid: number;
    constructor();
    openFile(fullFilePath: string): void;
    getProjectInfo(fullFilePath: string): void;
    getTypeDefinition(fullFilePath: string, line: number, col: number): Promise<void>;
    getFormattingEdits(fullFilePath: string, line: number, col: number, endLine: number, endCol: number): Promise<any>;
    getCompletions(fullFilePath: string, line: number, col: number, prefix: string): Promise<any>;
    getCompletionDetails(fullFilePath: string, line: number, col: number, entryNames: string[]): Promise<any>;
    updateFile(fullFilePath: string, updatedContents: string): Promise<void>;
    getQuickInfo(fullFilePath: string, line: number, col: number): Promise<void>;
    saveTo(fullFilePath: string, tmpFile: string): Promise<void>;
    getSignatureHelp(fullFilePath: string, line: number, col: number): Promise<void>;
    getErrors(fullFilePath: string): Promise<void>;
    getErrorsAcrossProject(fullFilePath: string): Promise<void>;
    getDocumentHighlights(fullFilePath: string, lineNumber: number, offset: number): Promise<void>;
    _makeTssRequest<T>(commandName: string, args: any): Promise<T>;
    private _parseResponse(returnedData);
    private _createDeferredPromise<T>();
}
