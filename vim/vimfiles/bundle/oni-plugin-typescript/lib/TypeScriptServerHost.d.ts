/// <reference types="node" />
/// <reference types="es6-promise" />
import * as events from "events";
/**
 * Taken from definitions here:
 * https://github.com/Microsoft/TypeScript/blob/master/lib/protocol.d.ts#L5
 */
export interface TextSpan {
    start: Location;
    end: Location;
}
export interface Location {
    line: number;
    offset: number;
}
export interface NavigationTree {
    text: string;
    kind: string;
    kindModifiers: string;
    spans: TextSpan[];
    childItems?: NavigationTree[];
}
/**
 * End definitions
 */
export declare class TypeScriptServerHost extends events.EventEmitter {
    private _tssProcess;
    private _seqNumber;
    private _seqToPromises;
    private _rl;
    readonly pid: number;
    constructor();
    openFile(fullFilePath: string): Promise<any>;
    getProjectInfo(fullFilePath: string): Promise<any>;
    getTypeDefinition(fullFilePath: string, line: number, col: number): Promise<void>;
    getFormattingEdits(fullFilePath: string, line: number, col: number, endLine: number, endCol: number): Promise<any>;
    getCompletions(fullFilePath: string, line: number, col: number, prefix: string): Promise<any>;
    getCompletionDetails(fullFilePath: string, line: number, col: number, entryNames: string[]): Promise<any>;
    updateFile(fullFilePath: string, updatedContents: string): Promise<void>;
    getQuickInfo(fullFilePath: string, line: number, col: number): Promise<void>;
    saveTo(fullFilePath: string, tmpFile: string): Promise<void>;
    getSignatureHelp(fullFilePath: string, line: number, col: number): Promise<any>;
    getErrors(fullFilePath: string): Promise<void>;
    getErrorsAcrossProject(fullFilePath: string): Promise<void>;
    getNavigationTree(fullFilePath: string): Promise<NavigationTree>;
    getDocumentHighlights(fullFilePath: string, lineNumber: number, offset: number): Promise<void>;
    _makeTssRequest<T>(commandName: string, args: any): Promise<T>;
    private _parseResponse(returnedData);
    private _createDeferredPromise<T>();
}
