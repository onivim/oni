import * as assert from "assert"
import * as sinon from "sinon"

import { Event } from "oni-types"
import { ErrorCodes } from "vscode-jsonrpc/lib/messages"

import { Definition } from "../../../src/Editor/NeovimEditor/Definition"
import { Symbols } from "../../../src/Editor/NeovimEditor/Symbols"
import { LanguageManager } from "../../../src/Services/Language"
import { Menu, MenuManager } from "../../../src/Services/Menu"

/* tslint:disable:no-string-literal */

const clock: any = global["clock"] // tslint:disable-line
const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

describe("Symbols", () => {
    let editor: any
    let definition: any
    let languageManager: any
    let menuManager: any
    let symbols: any

    beforeEach(() => {
        editor = sinon.stub()
        editor.activeBuffer = "mock buffer"
        definition = sinon.createStubInstance(Definition)
        languageManager = sinon.createStubInstance(LanguageManager)
        menuManager = sinon.createStubInstance(MenuManager)

        symbols = new Symbols(editor, definition, languageManager, menuManager)
    })

    describe("open workspace/document menus", () => {
        let menu: any
        let onFilterTextChanged: Event<string>
        let onItemSelected: Event<string>

        beforeEach(() => {
            menu = sinon.createStubInstance(Menu)
            onFilterTextChanged = new Event<string>()
            onItemSelected = new Event<string>()
            sinon.stub(menu, "onItemSelected").get(() => onItemSelected)
            sinon.stub(menu, "onFilterTextChanged").get(() => onFilterTextChanged)
            menuManager.create.returns(menu)

            symbols["_requestSymbols"] = sinon.stub().resolves(["first symbol", "second symbol"])
            const _symbolInfoToMenuItem = sinon.stub()
            _symbolInfoToMenuItem.onCall(0).returns("first transformed")
            _symbolInfoToMenuItem.onCall(1).returns("second transformed")
            symbols["_symbolInfoToMenuItem"] = _symbolInfoToMenuItem
        })

        describe("openWorkspaceSymbolsMenu", () => {
            let getKey: any

            beforeEach(() => {
                getKey = sinon.stub()
                symbols["_getDetailFromSymbol"] = sinon.stub().returns(getKey)
            })

            it("requests workspace symbols when filter text is changed", async () => {
                // setup
                symbols.openWorkspaceSymbolsMenu()
                clock.tick(30)
                sinon.assert.notCalled(symbols["_requestSymbols"])

                // action
                onFilterTextChanged.dispatch("mock query")

                // confirm
                clock.tick(24)
                sinon.assert.notCalled(symbols["_requestSymbols"])
                clock.tick(1)
                sinon.assert.calledWithExactly(
                    symbols["_requestSymbols"],
                    "mock buffer",
                    "workspace/symbol",
                    menu,
                    { query: "mock query" },
                )
                await waitForPromiseResolution()
                assertCommon()
            })
        })

        describe("openDocumentSymbolsMenu", () => {
            it("requests document symbols when completion menu is opened", async () => {
                // action
                await symbols.openDocumentSymbolsMenu()

                // confirm
                sinon.assert.calledWithExactly(
                    symbols["_requestSymbols"],
                    "mock buffer",
                    "textDocument/documentSymbol",
                    menu,
                )
                assertCommon()
            })
        })

        const assertCommon = () => {
            assert.deepEqual(symbols["_symbolInfoToMenuItem"].args, [
                ["first symbol"],
                ["second symbol"],
            ])
            sinon.assert.calledWithExactly(menu.setItems.lastCall, [
                "first transformed",
                "second transformed",
            ])
        }
    }) // End describe open menus

    describe("_requestSymbols", () => {
        let menu: any
        let buffer: any

        beforeEach(() => {
            menu = sinon.createStubInstance(Menu)
            menu.isOpen.returns(true)
            buffer = sinon.stub()
            buffer.language = "mocklang"
            buffer.filePath = "/mock/path"
        })

        it("throws on unknown errors", async () => {
            // setup
            const error = new Error()
            languageManager.sendLanguageServerRequest.throws(error)

            try {
                // action
                await symbols["_requestSymbols"](buffer, "mock command", menu)

                // confirm
                assert.fail("Expected exception to be thrown")
            } catch (e) {
                assert.strictEqual(e, error)
            }
        })

        it("retries whilst server is initialising", async () => {
            // setup
            const error: any = new Error()
            error.code = ErrorCodes.ServerNotInitialized
            languageManager.sendLanguageServerRequest.onCall(0).throws(error)
            languageManager.sendLanguageServerRequest.onCall(1).throws(error)
            languageManager.sendLanguageServerRequest.onCall(2).returns("mock result")

            // action
            const request: Promise<any> = symbols["_requestSymbols"](buffer, "mock command", menu, {
                mock: "option",
            })

            // confirm
            sinon.assert.callCount(languageManager.sendLanguageServerRequest, 1)
            clock.tick(999)
            await waitForPromiseResolution()
            sinon.assert.callCount(languageManager.sendLanguageServerRequest, 1)
            clock.tick(1)
            await waitForPromiseResolution()
            sinon.assert.callCount(languageManager.sendLanguageServerRequest, 2)
            clock.tick(1000)
            await waitForPromiseResolution()
            sinon.assert.callCount(languageManager.sendLanguageServerRequest, 3)
            clock.tick(1000)
            await waitForPromiseResolution()
            sinon.assert.callCount(languageManager.sendLanguageServerRequest, 3)
            clock.tick(1000)
            await waitForPromiseResolution()
            sinon.assert.alwaysCalledWith(
                languageManager.sendLanguageServerRequest,
                "mocklang",
                "/mock/path",
                "mock command",
                { mock: "option", textDocument: { uri: "file:///mock/path" } },
            )
            assert.equal(await request, "mock result")
        })

        it("gives up retrying if menu is closed", async () => {
            // setup
            const error: any = new Error()
            error.code = ErrorCodes.ServerNotInitialized
            languageManager.sendLanguageServerRequest.throws(error)

            // action
            const request: Promise<any> = symbols["_requestSymbols"](buffer, "mock command", menu)

            // confirm
            sinon.assert.callCount(languageManager.sendLanguageServerRequest, 1)
            clock.tick(1000)
            await waitForPromiseResolution()
            sinon.assert.callCount(languageManager.sendLanguageServerRequest, 2)
            menu.isOpen.returns(false)
            clock.tick(1000)
            await waitForPromiseResolution()
            sinon.assert.callCount(languageManager.sendLanguageServerRequest, 2)

            const result = await request

            assert.deepEqual(result, [])
        })
    })
})
