/**
 * VimConfigurationSynchronizerTests.ts
 */

import * as assert from "assert"

import {synchronizeTabSettings } from "./../../src/Services/VimConfigurationSynchronizer"

import * as Mocks from "./../Mocks/neovim"

describe("VimConfigurationSynchronizer", () => {

    let mockNeovimInstance: Mocks.MockNeovimInstance

    beforeEach(() => {
        mockNeovimInstance = new Mocks.MockNeovimInstance()
    })

    describe("synchronizeTabSettings", () => {

        it("doesn't synchronize if 'editor.insertSpaces' is not defined", () => {
            synchronizeTabSettings(mockNeovimInstance as any, { })
            assert.strictEqual(mockNeovimInstance.commandsSentToNeovim.length, 0, "Verify no commands sent to neovim")
        })

        it("doesn't synchronize if 'editor.insertSpaces' is null", () => {
            synchronizeTabSettings(mockNeovimInstance as any, { "editor.insertSpaces": null })
            assert.strictEqual(mockNeovimInstance.commandsSentToNeovim.length, 0, "Verify no commands sent to neovim")
        })

        it("sets 'noexpandtab' if 'editor.insertSpaces' is set to false", () => {
            synchronizeTabSettings(mockNeovimInstance as any, { "editor.insertSpaces": false })
            assert.deepEqual(mockNeovimInstance.commandsSentToNeovim, ["set noexpandtab"], "Verify noexpandtab is set")
        })

        it("sets 'expandtab' + space settings if set to true", () => {
            synchronizeTabSettings(mockNeovimInstance as any, { "editor.insertSpaces": true, "editor.tabSize": 3 })
            assert.deepEqual(mockNeovimInstance.commandsSentToNeovim, ["set expandtab", "set tabstop=3 shiftwidth=3 softtabstop=3"], "Verify expandtab + sizes are sent")
        })

        it("if 'editor.tabSize' is set without 'editor.insertSpaces', still gets set", () => {
            synchronizeTabSettings(mockNeovimInstance as any, { "editor.tabSize": 3 })
            assert.deepEqual(mockNeovimInstance.commandsSentToNeovim, ["set tabstop=3 shiftwidth=3 softtabstop=3"], "Verify expandtab + sizes are sent")
        })
    })
})
