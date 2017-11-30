/**
 * LanguageEditorIntegrationTests
 */

import * as assert from "assert"

// import * as types from "vscode-languageserver-types"

import { Editor } from "./../../../src/Editor/Editor"
import * as Language from "./../../../src/Services/Language"
import { ICompletablePromise, createCompletablePromise } from "./../../../src/Utility"

export class MockConfiguration {

    private _configurationValues: any = {}

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
    }

    public simulateBufferEnter(buffer: MockBuffer): void {
        this.notifyBufferEnter(buffer as any)
    }
}

export class MockBuffer {
}

export class MockRequestor<T> {

    private _completablePromises: ICompletablePromise<T>[] = []

    public get(language: string, filePath: string, line: number, column: number): Promise<T> {

        const newPromise = createCompletablePromise<T>()

        this._completablePromises.push(newPromise)

        return newPromise.promise
    }

    public resolve(val: T): void {
        const firstPromise = this._completablePromises.shift()
        firstPromise.resolve(val)
    }

    public reject(err?: Error): void {
        const firstPromise = this._completablePromises.shift()
        firstPromise.reject(err)
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

describe("LanguageEditorIntegration", () => {

    it("shows hover", () => {
        const mockConfiguration = new MockConfiguration()
        const mockEditor = new MockEditor()

        const mockDefinitionRequestor = new MockDefinitionRequestor()
        const mockHoverRequestor = new MockHoverRequestor()

        const lei = new Language.LanguageEditorIntegration(mockEditor, mockConfiguration as any, null, mockDefinitionRequestor, mockHoverRequestor)

        mockEditor.simulateModeChange("normal")
        mockEditor.simulateBufferEnter(new MockBuffer())

        lei.dispose()
        assert.ok(false, "fails")
    })

    it("respects editor.quickInfo.delay setting for hover", () => {
        assert.ok(false, "TODO")
    })

    it("hides quick info and hover when cursor moves", () => {
        assert.ok(false, "TODO")
    })

    it("doesn't show slow request that completes after buffer changed", () => {
        assert.ok(false, "TODO")
    })

    it("does not show hover when changing buffers", () => {
        const mockConfiguration = new MockConfiguration()
        const mockEditor = new MockEditor()

        const lei = new Language.LanguageEditorIntegration(mockEditor, mockConfiguration as any, null, null, null)

        lei.dispose()
        assert.ok(false, "fails")
    })
})
