/**
 * BrowserWindowConfigurationSynchronizer
 *
 * Takes configuration settings, and applies them to the BrowserWindow
 */

import * as Color from "color"
import { ipcRenderer, remote } from "electron"

import { Colors } from "./Colors"
import { Configuration, IConfigurationValues } from "./Configuration"

import { addDefaultUnitIfNeeded } from "./../Font"

export const activate = (configuration: Configuration, colors: Colors) => {
    const browserWindow = remote.getCurrentWindow()

    let loadInitVim: boolean = false
    const maximizeScreenOnStart: boolean = false

    const onColorsChanged = () => {
        // TODO: Read from 'persisted setting' instead
        const backgroundColor = colors.getColor("background")
        if (backgroundColor) {
            const background: string = Color(backgroundColor)
                .lighten(0.1)
                .hex()
                .toString()
            ;(browserWindow as any).setBackgroundColor(background)
        }
    }

    colors.onColorsChanged.subscribe(() => onColorsChanged())

    const onConfigChanged = (newConfigValues: Partial<IConfigurationValues>) => {
        document.body.style.fontFamily = configuration.getValue("ui.fontFamily")
        document.body.style.fontSize = addDefaultUnitIfNeeded(configuration.getValue("ui.fontSize"))
        document.body.style.fontVariant = configuration.getValue("editor.fontLigatures")
            ? "normal"
            : "none"

        const fontSmoothing = configuration.getValue("ui.fontSmoothing")

        if (fontSmoothing) {
            document.body.style["-webkit-font-smoothing"] = fontSmoothing
        }

        const hideMenu: boolean | "hidden" = configuration.getValue("oni.hideMenu")
        if (hideMenu === "hidden") {
            browserWindow.setMenu(null)
        } else {
            browserWindow.setAutoHideMenuBar(hideMenu)
            browserWindow.setMenuBarVisibility(!hideMenu)
        }

        const loadInit: boolean = configuration.getValue("oni.loadInitVim")
        if (loadInit !== loadInitVim) {
            ipcRenderer.send("rebuild-menu", loadInit)
            // don't rebuild menu unless oni.loadInitVim actually changed
            loadInitVim = loadInit
        }

        const maximizeScreen: boolean = configuration.getValue("editor.maximizeScreenOnStart")
        if (maximizeScreen !== maximizeScreenOnStart) {
            browserWindow.maximize()
        }

        browserWindow.setFullScreen(configuration.getValue("editor.fullScreenOnStart"))
    }

    onConfigChanged(configuration.getValues())
    configuration.onConfigurationChanged.subscribe(onConfigChanged)
}
