import * as ChildProcess from "child_process"
import { EventEmitter } from "events"

import * as types from "vscode-languageserver-types"

declare namespace Oni {

    export interface EventCallback<T> {
        (val: T): void
    }

    export interface Event<T> {
        subscribe(callback: EventCallback<T>)
    }

    export interface Configuration {
        onConfigurationChangedEvent: Event<void>
        getValue<T>(configValue: string, defaultValue?: T): T
    }

    export interface Editor {
        executeShellCommand(shellCommand: string): void
    }

    export interface Commands {
        registerCommand(commandName: string, callback: (args?: any) => void): void
    }

    export interface StatusBar {
        getItem(globalId?: string): StatusBarItem
        createItem(alignment: number, priority: number, globalId?: string): StatusBarItem
    }

    export interface Process {
        execNodeScript(scriptPath: string, args?: string[], options?: ChildProcess.ExecOptions, callback?: (err: any, stdout: string, stderr: string) => void): ChildProcess.ChildProcess
        spawnNodeScript(scriptPath: string, args?: string[], options?: ChildProcess.SpawnOptions): ChildProcess.ChildProcess
        spawnProcess(startCommand: string, args?: string[], options?: ChildProcess.SpawnOptions): ChildProcess.ChildProcess
    }

    export interface StatusBarItem {
        show(): void
        hide(): void
        setContents(element: JSX.Element): void
        dispose(): void
    }

    export interface Position {
        line: number
        column: number
    }

    export interface Range {
        start: Position
        end: Position
    }

    export interface TextEdit extends Range {
        newValue: string
    }

    /**
     * Describes the change of an entire buffer
     */
    export interface BufferUpdateContext {
        bufferLines: string[]
        eventContext: EventContext
    }

    /**
     * Incremental buffer update describes the change for a particular line of a document
     */
    export interface IncrementalBufferUpdateContext {
        lineNumber: number
        bufferLine: string
        eventContext: EventContext
    }

    export interface EventContext {
        bufferFullPath: string
        bufferTotalLines: number
        bufferNumber: number

        version: number
        line: number

        /**
         * Column within the buffer
         */
        column: number
        byte: number
        filetype: string

        /**
         * Actual column position within the window
         * Includes line number, gutter, etc
         */
        windowNumber: number
        wincol: number
        winline: number
        windowTopLine: number
        windowBottomLine: number
    }

    // export interface TextDocumentPosition {
    //     // TODO: Reconcile these - remove buffer
    //     bufferFullPath?: string
    //     filePath?: string
    //     line: number
    //     column: number
    //     byte?: number
    // }

    export namespace Menu {
        export interface MenuOption {
            /**
             * Optional font-awesome icon
             */
            icon?: string

            label: string
            detail: string

            /**
             * A pinned option is always shown first in the menu,
             * before unpinned items
             */
            pinned?: boolean
        }
    }

    export namespace Plugin {
        export namespace Diagnostics {
            export interface Api {
                setErrors(key: string, fileName: string, errors: types.Diagnostic[])
                clearErrors(key: string)
            }
        }

        export interface QuickInfo {
            title: string
            description: string

            error?: string
        }

        export interface GotoDefinitionResponse extends Position {
            filePath: string
        }

        export interface FormattingEditsResponse {
            filePath: string
            version: number
            edits: TextEdit[]
        }

        export interface Api extends EventEmitter {
            configuration: Configuration
            diagnostics: Diagnostics.Api
            editor: Editor
            process: Process
            statusBar: StatusBar

            registerLanguageService(languageType: string, languageService: LanguageService)

            clearHighlights(file: string, key: string)
            setHighlights(file: string, key: string, highlights: SyntaxHighlight[])
        }

        export interface CompletionResult {

            /**
             * Base entry being completed against
             */
            base: string
            completions: CompletionInfo[]

            error?: string
        }

        export interface SyntaxHighlight {
            highlightKind: types.SymbolKind
            token: string
        }

        //export type CompletionKind = "method" | "function" | "var"

        export interface CompletionInfo {
            highlightColor?: string,
            kind?: types.CompletionItemKind
            label: string
            detail?: string
            documentation?: string
        }

        export interface EvaluationResult {
            line: number
            result: any
            variables?: any
            output?: string[]
            errors?: string[]
        }

        export interface SignatureHelpItem {
            variableArguments: boolean
            prefix: string
            suffix: string
            separator: string
            parameters: SignatureHelpParameter[]
        }

        export interface SignatureHelpParameter {
            text: string
            documentation: string
        }

        export interface SignatureHelpResult {
            items: SignatureHelpItem[]
            selectedItemIndex: number
            argumentIndex: number
            argumentCount: number

            error?: string
        }

        export interface ReferencesResultItem extends Position {
            fullPath: string
            lineText?: string
        }

        export interface ReferencesResult {
            tokenName: string
            items: ReferencesResultItem[]
        }

        export interface LanguageService {
            getCompletions?(position: EventContext): Promise<CompletionResult>
            getCompletionDetails?(position: EventContext, completionInfo: CompletionInfo): Promise<CompletionInfo>

            findAllReferences?(position: EventContext): Promise<ReferencesResult>

            getSignatureHelp?(position: EventContext): Promise<SignatureHelpResult>

            getQuickInfo?(position: EventContext): Promise<QuickInfo>
            getDefinition?(position: EventContext): Promise<GotoDefinitionResponse>

            getFormattingEdits?(position: EventContext): Promise<FormattingEditsResponse>

            evaluateBlock?(context: EventContext, id: string, fileName: string, code: string): Promise<EvaluationResult>
            // liveEvaluate(): LiveEvaluationResult[]
        }
    }
}

export = Oni
export as namespace Oni

