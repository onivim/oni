import * as assert from "assert"

// import * as Oni from "oni-api"

import * as NeovimEditor from "./../../../src/Editor/NeovimEditor"
// import { DiagnosticsDataSource } from "./../../../src/Services/Diagnostics"
// import { ThemeManager } from "./../../../src/Services/Themes"

// import * as Mocks from "./../../Mocks"

describe("NeovimEditor", () => {
    // it("initializes", () => {

    //     const colors = new Mocks.MockColors()
    //     const configuration = new Mocks.MockConfiguration({
    //         "editor.fontFamily": "Unit Testolas",
    //     })
    //     const diagnostics = new DiagnosticsDataSource()
    //     const languageManager = new Mocks.MockLanguageManager()
    //     const themeManager = new ThemeManager()

    //     const editor = new NeovimEditor.NeovimEditor(colors, configuration as any, diagnostics, languageManager as any, themeManager)

    //     assert.ok(true, "hello")
    //     return editor.init([])
    // })
    
    describe("sanitizeMode", () => {
        it("passes through non-showmatch values", () => {
            const insertMode = NeovimEditor.sanitizeMode("insert")
            assert.strictEqual(insertMode, "insert")
        })

        it("replaces showmatch with insert", () => {
            const showmatchMode = NeovimEditor.sanitizeMode("showmatch")
            assert.strictEqual(showmatchMode, "insert")
        })
    })
})
