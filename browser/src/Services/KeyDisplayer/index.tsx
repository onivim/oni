/**
 * KeyDisplayer
 *
 * Utility for showing keys while typing
 */

import { CommandManager } from "./../CommandManager"
import { InputManager } from "./../InputManager"
import { OverlayManager } from "./../Overlay"

export interface IKeyPressInfo {
    timeInMilliseconds: number
    key: string
}

import { KeyDisplayer } from "./KeyDisplayer"

export const activate = (
    commandManager: CommandManager,
    inputManager: InputManager,
    overlayManager: OverlayManager,
) => {
    const keyDisplayer = new KeyDisplayer(inputManager, overlayManager)

    commandManager.registerCommand({
        command: "keyDisplayer.show",
        name: "Input: Show key presses",
        detail: "Show typed keys in an overlay.",
        execute: () => keyDisplayer.start(),
        enabled: () => !keyDisplayer.isActive,
    })

    commandManager.registerCommand({
        command: "keyDisplayer.hide",
        name: "Input: Hide key presses",
        detail: "Turn off visible typing.",
        execute: () => keyDisplayer.end(),
        enabled: () => keyDisplayer.isActive,
    })
}
