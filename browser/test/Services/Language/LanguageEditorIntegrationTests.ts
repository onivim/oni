/**
 * LanguageEditorIntegrationTests
 */

import * as assert from "assert"

// import * as types from "vscode-languageserver-types"

import { Editor } from "./../../../src/Editor/Editor"
import { LanguageEditorIntegration } from "./../../../src/Services/Language/LanguageEditorIntegration"

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
    
}

describe("LanguageEditorIntegration", () => {
    it("does not show hover when changing buffers", () => {
        const mockConfiguration = new MockConfiguration()
        const mockEditor = new MockEditor()

        const lei = new LanguageEditorIntegration(mockEditor, mockConfiguration as any, null, null, null)

        lei.dispose()
        assert.ok(false, "fails")
    })
})
