/**
 * Mocks/index.ts
 *
 * Implementations of test mocks and doubles,
 * to exercise boundaries of class implementations
 */

import { Editor } from "./../../src/Editor/Editor"
import * as Language from "./../../src/Services/Language"
import { createCompletablePromise, ICompletablePromise } from "./../../src/Utility"

export class MockConfiguration {

    constructor(
        private _configurationValues: any = {},
    ) {}

    public getValue(key: string): any {
        return this._configurationValues[key]
    }

    public setValue(key: string, value: any): void {
        this._configurationValues[key] = value
    }
}

export class MockEditor extends Editor {
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
        this.notifyBufferEnter(buffer as any)
    }
}

export class MockBuffer {
}

export class MockRequestor<T> {

    private _completablePromises: Array<ICompletablePromise<T>> = []

    public get pendingCallCount(): number {
        return this._completablePromises.length
    }

    public get(language: string, filePath: string, line: number, column: number): Promise<T> {

        const newPromise = createCompletablePromise<T>()

        this._completablePromises.push(newPromise)

        return newPromise.promise
    }

    public resolve(val: T): void {
        const firstPromise = this._completablePromises.shift()
        firstPromise.resolve(val)
    }
}

export class MockDefinitionRequestor extends MockRequestor<Language.IDefinitionResult> implements Language.IDefinitionRequestor {
    public getDefinition(language: string, filePath: string, line: number, column: number): Promise<Language.IDefinitionResult> {
        return this.get(language, filePath, line, column)
    }
}

export class MockHoverRequestor extends MockRequestor<Language.IHoverResult> implements Language.IHoverRequestor {
    public getHover(language: string, filePath: string, line: number, column: number): Promise<Language.IHoverResult> {
        return this.get(language, filePath, line, column)
    }
}
