export * from "./Menu"
export * from "./MenuComponent"
export * from "./MenuFilter"

import { Configuration } from "./../Configuration"
import { OverlayManager } from "./../Overlay"
import { MenuManager } from "./Menu"

let _menuManager: MenuManager

export const activate = (configuration: Configuration, overlayManager: OverlayManager) => {
    _menuManager = new MenuManager(configuration, overlayManager)
}

export const getInstance = (): MenuManager => {
    return _menuManager
}
