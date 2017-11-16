import * as ChildProcess from "child_process"
import { EventEmitter } from "events"

import * as types from "vscode-languageserver-types"

declare namespace Oni {

    export type DisposeFunction = () => void

    export interface IDisposable {
        dispose(): void
    }

    export interface IEvent<T> {
        subscribe(callback: EventCallback<T>): IDisposable
    }

    export interface EventCallback<T> {
        (val: T): void
    }

    export interface IToken {
        tokenName: string
        range: types.Range
    }

    export interface Event<T> {
        subscribe(callback: EventCallback<T>)
    }

    export interface Configuration {
        onConfigurationChanged: Event<any>
        getValue<T>(configValue: string, defaultValue?: T): T
        setValues(configurationValues: { [configValue: string]: any }): void
    }

    export interface Workspace {
        onDirectoryChanged: Event<string>
    }

    export interface IWindowManager {
        split(direction: number, split: IWindowSplit)
        showDock(direction: number, split: IWindowSplit)
        moveLeft(): void
        moveRight(): void
        moveDown(): void
        moveUp(): void
        close(editor: Oni.Editor)
    }

    export interface IWindowSplit {
        render(): JSX.Element
    }

    export interface EditorManager {
        allEditors: Editor
        activeEditor: Editor
    }

    export interface InputManager {
        bind(keyChord: string | string[], actionFunction: any, filterFunction?: () => boolean)
        unbind(keyChord: string | string[])
        unbindAll()
    }

    export interface NeovimEditorCapability {

        // Call a VimL function and return the result
        callFunction(functionName: string, args: any[]): Promise<any>

        // Send a direct set of key inputs to Neovim
        input(keys: string): Promise<void>

        // Evaluate an expression, and return the result
        eval(expression: string): Promise<any>

        // Execute a command
        command(command: string): Promise<void>
    }

    export interface Editor {
        mode: string
        onModeChanged: IEvent<Vim.Mode>

        activeBuffer: Buffer

        openFile(file: string): Promise<Buffer>

        onBufferEnter: IEvent<EditorBufferEventArgs>
        onBufferLeave: IEvent<EditorBufferEventArgs>
        onBufferChanged: IEvent<EditorBufferChangedEventArgs>
        onBufferSaved: IEvent<EditorBufferEventArgs>

        // Optional capabilities for the editor to implement
        neovim?: NeovimEditorCapability
    }

    export interface EditorBufferChangedEventArgs {
        buffer: Oni.Buffer
        contentChanges: types.TextDocumentContentChangeEvent[]
    }

    export interface Buffer {
        id: string
        language: string
        filePath: string
        cursor: Cursor
        version: number
        modified: boolean

        lineCount: number

        applyTextEdits(edit: types.TextEdit | types.TextEdit[]): Promise<void>
        getLines(start?: number, end?: number): Promise<string[]>
        getTokenAt(line: number, column: number): Promise<IToken>
        getSelectionRange(): Promise<types.Range>

        setLines(start: number, end: number, lines: string[]): Promise<void>
        setCursorPosition(line: number, column: number): Promise<void>
    }

    // Zero-based position of the cursor
    // Note that in Vim, this is a 1-based position
    export interface Cursor {
        line: number
        column: number
    }

    // TODO: Remove this, replace with buffer
    export interface EditorBufferEventArgs {
        language: string
        filePath: string
    }

    export type ICommandCallback = (args?: any) => any
    export type ICommandEnabledCallback = () => boolean

    export interface ICommand {
        command: string
        name: string
        detail: string
        enabled?: ICommandEnabledCallback
        messageSuccess?: string
        messageFail?: string
        execute: ICommandCallback
    }

    export interface Commands {
        registerCommand(command: ICommand): void
    }

    export interface Log {
        verbose(msg: string): void
        info(msg: string): void

        disableVerboseLogging(): void
        enableVerboseLogging(): void
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

        modified: boolean
        hidden: boolean
        listed: boolean
        version: number
        line: number

        /**
         * Column within the buffer
         */
        column: number
        byte: number
        filetype: string

        windowNumber: number
        wincol: number
        winline: number
        windowTopLine: number
        windowBottomLine: number
        windowWidth: number,
        windowHeight: number,
    }

    export namespace Vim {
        export type Mode = "normal" | "visual" | "insert"
    }

    export namespace Automation {
        // Api surface area for automated testing
        export interface Api {
            sendKeys(input: string): void
            waitFor(condition: () => boolean, timeout: number): Promise<void>

            runTest(testPath: string): Promise<void>
        }
    }

    export namespace Coordinates {
        export interface PixelSpacePoint {
            pixelX: number
            pixelY: number
        }
    }

    export namespace ToolTip {
        export enum OpenDirection {
            Up = 1,
            Down= 2,
        }
        export interface ToolTipOptions {
            position?: Coordinates.PixelSpacePoint
            openDirection: OpenDirection
            padding?: string
            onDismiss?: () => void
        }
    }

    export namespace Menu {
        export interface MenuOption {
            /**
             * Optional font-awesome icon
             */
            icon?: string

            label: string
            detail?: string

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
            }
        }

        export interface Api extends EventEmitter {
            automation: Automation.Api
            configuration: Configuration
            contextMenu: any /* TODO */
            diagnostics: Diagnostics.Api
            editors: EditorManager
            input: InputManager
            language: any /* TODO */
            log: any /* TODO */
            menu: any /* TODO */
            process: Process
            statusBar: StatusBar
            workspace: Workspace
        }
    }
}

export = Oni
export as namespace Oni

