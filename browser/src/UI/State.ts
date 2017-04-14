
import * as Config from  "./../Config"
import { ILog } from "./Logs"
import { Rectangle } from "./Types"

export interface IState {
    cursorPixelX: number
    cursorPixelY: number
    cursorPixelWidth: number
    cursorCharacter: string
    fontPixelWidth: number
    fontPixelHeight: number
    mode: string
    backgroundColor: string
    foregroundColor: string
    autoCompletion: null | IAutoCompletionInfo
    quickInfo: null | Oni.Plugin.QuickInfo
    popupMenu: null | IMenu
    signatureHelp: null | Oni.Plugin.SignatureHelpResult
    cursorLineVisible: boolean
    cursorLineOpacity: number
    cursorColumnVisible: boolean
    cursorColumnOpacity: number
    configuration: Config.IConfigValues
    showNeovimInstallHelp: boolean

    logsVisible: boolean
    logs: Array<{
        log: ILog,
        folded: boolean,
    }>

    // Dimensions of active window, in pixels
    activeWindowDimensions: Rectangle
}

export function readConf <K extends keyof Config.IConfigValues>(conf: Config.IConfigValues, k: K): Config.IConfigValues[K] {
    return conf[k]
}

export interface IMenu {
    id: string,
    filter: string,
    filteredOptions: IMenuOptionWithHighlights[],
    options: Oni.Menu.MenuOption[],
    selectedIndex: number
}

export interface IMenuOptionWithHighlights extends Oni.Menu.MenuOption {
    labelHighlights: number[][],
    detailHighlights: number[][]
}

export interface IAutoCompletionInfo {

    /**
     * Base entry being completed against
     */
    base: string

    entries: Oni.Plugin.CompletionInfo[]

    /**
     * Label of selected entry
     */
    selectedIndex: number
}
const notifs: ILog[] = [{
    type: "success",
    message: "Yeah, success!",
    details: null,
}, {
    type: "info",
    message: "Some info for you",
    details: null,
}, {
    type: "warning",
    message: "Oops warning",
    details: null,
}, {
    type: "error",
    message: "Failed to load your user config",
    details: [
        "line 6: unexpected newline",
        "'metrics' ::",
        "^",
    ],
}, {
    type: "fatal",
    message: "Uncaught ReferenceError: abc is not defined",
    details: [
        "ReferenceError: abc is not defined",
        " at atom-workspace.&lt;anonymous&gt; (/Users/simBook/Sir/atom/notifications/lib/main.coffee:113:7)",
        " at CommandRegistry.module.exports.CommandRegistry.handleCommandEvent (/Users/simBook/github/atom/src/command-registry.coffee:225:27)",
        " at CommandRegistry.handleCommandEvent (/Users/simBook/github/atom/src/command-registry.coffee:1:1)",
        " at CommandRegistry.module.exports.CommandRegistry.dispatch (/Users/simBook/github/atom/src/command-registry.coffee:173:6)",
        " at NotificationsPanelView.module.exports.NotificationsPanelView.createFatalError (/Users/simBook/Sir/atom/notifications/lib/notifications-panel-view.coffee:48:19)",
        " at HTMLButtonElement.&lt;anonymous&gt; (/Users/simBook/Sir/atom/notifications/lib/notifications-panel-view.coffee:3:1)",
    ],
}]
export const createDefaultState = (): IState => ({
    cursorPixelX: 10,
    cursorPixelY: 10,
    cursorPixelWidth: 10,
    cursorCharacter: "",
    fontPixelWidth: 10,
    fontPixelHeight: 10,
    mode: "normal",
    foregroundColor: "rgba(0, 0, 0, 0)",
    autoCompletion: null,
    quickInfo: null,
    popupMenu: null,
    signatureHelp: null,
    activeWindowDimensions: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    },
    cursorLineVisible: false,
    cursorLineOpacity: 0,
    cursorColumnVisible: false,
    cursorColumnOpacity: 0,
    backgroundColor: "#000000",
    showNeovimInstallHelp: false,
    logsVisible: false,
    logs: notifs.map((n) => ({
        log: n,
        folded: true,
    })),
    configuration: Config.instance().getValues(),
})
