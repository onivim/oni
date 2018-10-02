import * as Oni from "oni-api"

import MockCommands from "./CommandManager"
import MockEditorManager from "./EditorManager"
import MockSidebar from "./../mocks/Sidebar"
import MockStatusbar from "./Statusbar"
import MockWorkspace from "./Workspace"

const MockOni = jest
    .fn<Oni.Plugin.Api>()
    .mockImplementation((values: { apiMock: { [k: string]: any } }) => {
        const commands = new MockCommands()
        const editors = new MockEditorManager()
        const sidebar = new MockSidebar()
        const statusBar = new MockStatusbar()
        const workspace = new MockWorkspace()

        return {
            commands,
            configuration: {
                getValue: jest.fn(),
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
            ...values,
        }
    })

export default MockOni
