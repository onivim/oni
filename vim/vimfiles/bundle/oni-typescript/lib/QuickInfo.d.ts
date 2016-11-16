/**
 * QuickInfo.ts
 *
 * Show QuickInfo (or error) as cursor moves in normal mode
 */
import { TypeScriptServerHost } from "./TypeScriptServerHost";
export declare class QuickInfo {
    private _host;
    private _oni;
    constructor(oni: any, host: TypeScriptServerHost);
    showQuickInfo(fullBufferPath: string, line: number, col: number): void;
}
