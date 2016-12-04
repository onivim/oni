/// <reference types="node" />
/// <reference types="es6-promise" />
import * as events from "events";
/**
 * Taken from definitions here:
 * https://github.com/Microsoft/TypeScript/blob/master/lib/protocol.d.ts#L5
 */
export interface ITextSpan {
    start: ILocation;
    end: ILocation;
}
export interface ILocation {
    line: number;
    offset: number;
}
export interface INavigationTree {
    text: string;
    kind: string;
    kindModifiers: string;
    spans: ITextSpan[];
    childItems?: INavigationTree[];
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
    openFile(file: string): Promise<any>;
    getProjectInfo(file: string): Promise<any>;
    getTypeDefinition(file: string, line: number, offset: number): Promise<void>;
    getFormattingEdits(file: string, line: number, offset: number, endLine: number, endOffset: number): Promise<any>;
    getCompletions(file: string, line: number, offset: number, prefix: string): Promise<any>;
    getCompletionDetails(file: string, line: number, offset: number, entryNames: string[]): Promise<any>;
    updateFile(file: string, fileContent: string): Promise<void>;
    getQuickInfo(file: string, line: number, offset: number): Promise<void>;
    saveTo(file: string, tmpfile: string): Promise<void>;
    getSignatureHelp(file: string, line: number, offset: number): Promise<any>;
    getErrors(fullFilePath: string): Promise<void>;
    getErrorsAcrossProject(fullFilePath: string): Promise<void>;
    getNavigationTree(fullFilePath: string): Promise<INavigationTree>;
    getDocumentHighlights(file: string, line: number, offset: number): Promise<void>;
    _makeTssRequest<T>(commandName: string, args: any): Promise<T>;
    private _parseResponse(returnedData);
    private _createDeferredPromise<T>();
}
