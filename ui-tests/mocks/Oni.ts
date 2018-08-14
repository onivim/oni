import * as Oni from "oni-api"

import MockCommands from "./CommandManager"
// import MockConfiguration from "./Configuration"
import MockEditorManager from "./EditorManager"
import MockMenu from "./MenuManager"
import MockSidebar from "./../mocks/Sidebar"
import MockStatusbar from "./Statusbar"
import MockWorkspace from "./Workspace"

const MockOni = jest.fn<Oni.Plugin.Api>().mockImplementation(() => {
    const commands = new MockCommands()
    const editors = new MockEditorManager()
    const sidebar = new MockSidebar()
    const statusBar = new MockStatusbar()
    const workspace = new MockWorkspace()
    // const configuration = new MockConfiguration()

    return {
        commands,
        configuration: {
            getValue: () => true,
        },
        editors,
        sidebar,
        statusBar,
        workspace,
        filter: null,
        input: null,
        language: null,
        log: null,
        notifications: null,
        overlays: null,
        plugins: null,
        search: null,
        ui: null,
        menu: null,
        process: null,
        recorder: null,
        snippets: null,
        windows: null,
        automation: null,
        colors: null,
        contextMenu: null,
        diagnostics: null,
        populateQuickFix(entries: Oni.QuickFixEntry[]): void {
            throw Error("Not yet implemented")
        },
    }
})

export default MockOni
