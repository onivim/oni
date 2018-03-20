/**
 * Mocks/index.ts
 *
 * Implementations of test mocks and doubles,
 * to exercise boundaries of class implementations
 */

export * from "./MockBuffer"
export * from "./neovim/MockNeovimInstance"
export * from "./MockPluginManager"
export * from "./MockThemeLoader"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import * as types from "vscode-languageserver-types"

import { Editor } from "./../../src/Editor/Editor"

import * as Language from "./../../src/Services/Language"
import { createCompletablePromise, ICompletablePromise } from "./../../src/Utility"

import { TokenColor } from "./../../src/Services/TokenColors"
import { IWorkspace } from "./../../src/Services/Workspace"

export class MockWindowSplit {
    public get id(): string {
        return this._id
    }

    public get innerSplit(): any {
        return null
    }

    constructor(private _id: string = "mock.window") {}

    public render(): JSX.Element {
        return null
    }
}

export class MockTokenColors {
    constructor(private _tokenColors: TokenColor[] = []) {}

    public get tokenColors(): TokenColor[] {
        return this._tokenColors
    }
}

import { MockBuffer } from "./MockBuffer"

export class MockConfiguration {
    private _currentConfigurationFiles: string[] = []
    private _onConfigurationChanged = new Event<any>()

    public get onConfigurationChanged(): IEvent<any> {
        return this._onConfigurationChanged
    }

    public get currentConfigurationFiles(): string[] {
        return this._currentConfigurationFiles
    }

    constructor(private _configurationValues: any = {}) {}

    public getValue(key: string): any {
        return this._configurationValues[key]
    }

    public setValue(key: string, value: any): void {
        this._configurationValues[key] = value
    }

    public addConfigurationFile(filePath: string): void {
        this._currentConfigurationFiles = [...this._currentConfigurationFiles, filePath]
    }

    public removeConfigurationFile(filePath: string): void {
        this._currentConfigurationFiles = this._currentConfigurationFiles.filter(
            fp => fp !== filePath,
        )
    }

    public simulateConfigurationChangedEvent(changedConfigurationValues: any): void {
        this._onConfigurationChanged.dispatch(changedConfigurationValues)
    }
}

export class MockWorkspace implements IWorkspace {
    private _activeWorkspace: string = null
    private _onDirectoryChangedEvent = new Event<string>()
    private _onFocusGainedEvent = new Event<void>()
    private _onFocusLostEvent = new Event<void>()

    public get onDirectoryChanged(): IEvent<string> {
        return this._onDirectoryChangedEvent
    }

    public get onFocusGained(): IEvent<void> {
        return this._onFocusGainedEvent
    }

    public get onFocusLost(): IEvent<void> {
        return this._onFocusLostEvent
    }

    public get activeWorkspace(): string {
        return this._activeWorkspace
    }

    public changeDirectory(newDirectory: string): void {
        // tslint:disable-line

        this._activeWorkspace = newDirectory
        this._onDirectoryChangedEvent.dispatch(newDirectory)
    }

    public async applyEdits(edits: types.WorkspaceEdit): Promise<void> {
        return null
    }
}

export class MockStatusBarItem implements Oni.StatusBarItem {
    public show(): void {
        // tslint:disable-line
    }

    public hide(): void {
        // tslint:disable-line
    }

    public setContents(element: JSX.Element): void {
        // tslint:disable-line
    }

    public dispose(): void {
        // tslint:disable-line
    }
}

export class MockStatusBar implements Oni.StatusBar {
    public getItem(globalId: string): Oni.StatusBarItem {
        return new MockStatusBarItem()
    }

    public createItem(alignment: number, globalId: string): Oni.StatusBarItem {
        return new MockStatusBarItem()
    }
}

export class MockEditor extends Editor {
    private _activeBuffer: MockBuffer = null
    private _currentSelection: types.Range = null

    public get activeBuffer(): Oni.Buffer {
        return this._activeBuffer as any
    }

    public simulateModeChange(newMode: string): void {
        this.setMode(newMode as any)
    }

    public simulateCursorMoved(line: number, column: number): void {
        this.notifyCursorMoved({
            line,
            column,
        })
    }

    public simulateBufferEnter(buffer: MockBuffer): void {
        this._activeBuffer = buffer
        this.notifyBufferEnter(buffer as any)
    }

    public async setSelection(range: types.Range): Promise<void> {
        this._currentSelection = range
    }

    public async getSelection(): Promise<types.Range> {
        return this._currentSelection
    }

    public async clearSelection(): Promise<void> {
        // tslint:disable-line
    }

    public setActiveBufferLine(line: number, lineContents: string): void {
        this._activeBuffer.setLineSync(line, lineContents)

        this.notifyBufferChanged({
            buffer: this._activeBuffer as any,
            contentChanges: [
                {
                    range: types.Range.create(line, 0, line + 1, 0),
                    text: lineContents,
                },
            ],
        })
    }
}

const DefaultCursorMatchRegEx = /[a-z]/i
const DefaultTriggerCharacters = ["."]

export class MockLanguageManager {
    public getTokenRegex(language: string): RegExp {
        return DefaultCursorMatchRegEx
    }

    public getCompletionTriggerCharacters(language: string): string[] {
        return DefaultTriggerCharacters
    }
}

export class MockRequestor<T> {
    private _completablePromises: Array<ICompletablePromise<T>> = []

    public get pendingCallCount(): number {
        return this._completablePromises.length
    }

    public get(...args: any[]): Promise<T> {
        const newPromise = createCompletablePromise<T>()

        this._completablePromises.push(newPromise)

        return newPromise.promise
    }

    public resolve(val: T): void {
        const firstPromise = this._completablePromises.shift()
        firstPromise.resolve(val)
    }
}

export class MockDefinitionRequestor extends MockRequestor<Language.IDefinitionResult>
    implements Language.IDefinitionRequestor {
    public getDefinition(
        language: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<Language.IDefinitionResult> {
        return this.get(language, filePath, line, column)
    }
}

export class MockHoverRequestor extends MockRequestor<Language.IHoverResult>
    implements Language.IHoverRequestor {
    public getHover(
        language: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<Language.IHoverResult> {
        return this.get(language, filePath, line, column)
    }
}
