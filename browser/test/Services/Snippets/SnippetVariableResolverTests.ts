/**
 * SnippetVariableResolverTests.ts
 */

import * as assert from "assert"

import { SnippetVariableResolver } from "./../../../src/Services/Snippets"

import { MockBuffer } from "./../../Mocks"

const createMockVariable = (name: string): any => ({
    name,
})

describe("SnippetVariableResolverTests", () => {
    it("tests", async () => {
        const buffer = new MockBuffer("typescript", "test.ts")
        buffer.setCursorPosition(1, 1)

        const variableResolver = new SnippetVariableResolver(buffer as any)

        assert.strictEqual(variableResolver.resolve(createMockVariable("TM_FILENAME_BASE")), "test")
        assert.strictEqual(variableResolver.resolve(createMockVariable("TM_LINE_INDEX")), "1")
        assert.strictEqual(variableResolver.resolve(createMockVariable("TM_LINE_NUMBER")), "2")
    })
})
