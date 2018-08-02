import * as Oni from "oni-api"

import MockCommands from "./CommandManager"
import { configuration } from "./Configuration"
import MockEditorManager from "./EditorManager"
import MockMenu from "./MenuManager"
import MockSidebar from "./../mocks/Sidebar"
import MockStatusbar from "./Statusbar"
import MockWorkspace from "./Workspace"

class MockOni implements Oni.Plugin.Api {
    private _commands = new MockCommands()
    private _configuration = configuration
    private _editorManager = new MockEditorManager()
    private _sidebar = new MockSidebar()
    private _statusBar = new MockStatusbar()
    private _workspace = new MockWorkspace()

    get automation(): Oni.Automation.Api {
        throw Error("Not yet implemented")
    }

    get colors(): Oni.IColors {
        throw Error("Not yet implemented")
    }

    get commands(): Oni.Commands.Api {
        return this._commands
    }

    get configuration(): Oni.Configuration {
        return this._configuration
    }

    get contextMenu(): any /* TODO */ {
        throw Error("Not yet implemented")
    }

    get diagnostics(): Oni.Plugin.Diagnostics.Api {
        throw Error("Not yet implemented")
    }

    get editors(): Oni.EditorManager {
        return this._editorManager
    }

    get filter(): Oni.Menu.IMenuFilters {
        throw Error("Not yet implemented")
    }

    get input(): Oni.Input.InputManager {
        throw Error("Not yet implemented")
    }

    get language(): any /* TODO */ {
        throw Error("Not yet implemented")
    }

    get log(): any /* TODO */ {
        throw Error("Not yet implemented")
    }

    get notifications(): Oni.Notifications.Api {
        throw Error("Not yet implemented")
    }

    get overlays(): Oni.Overlays.Api {
        throw Error("Not yet implemented")
    }

    get plugins(): Oni.IPluginManager {
        throw Error("Not yet implemented")
    }

    get search(): Oni.Search.ISearch {
        throw Error("Not yet implemented")
    }

    get sidebar(): Oni.Sidebar.Api {
        return this._sidebar
    }

    get ui(): Oni.Ui.IUi {
        throw Error("Not yet implemented")
    }

    get menu(): Oni.Menu.Api {
        throw Error("Not yet implemented")
    }

    get process(): Oni.Process {
        throw Error("Not yet implemented")
    }

    get recorder(): Oni.Recorder {
        throw Error("Not yet implemented")
    }

    get snippets(): Oni.Snippets.SnippetManager {
        throw Error("Not yet implemented")
    }

    get statusBar(): Oni.StatusBar {
        return this._statusBar
    }

    get windows(): Oni.IWindowManager {
        throw Error("Not yet implemented")
    }

    get workspace(): Oni.Workspace.Api {
        return this._workspace
    }

    public populateQuickFix(entries: Oni.QuickFixEntry[]): void {
        throw Error("Not yet implemented")
    }
}

export default MockOni
