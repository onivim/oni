/**
 * KeyDisplayer
 *
 * Utility for showing keys while typing
 */

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { InputManager } from "./../InputManager"
import { OverlayManager } from "./../Overlay"

export interface IKeyPressInfo {
    timeInMilliseconds: number
    key: string
}

import { KeyDisplayer } from "./KeyDisplayer"

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
    inputManager: InputManager,
    overlayManager: OverlayManager,
) => {
    const keyDisplayer = new KeyDisplayer(
        configuration,
        editorManager,
        inputManager,
        overlayManager,
    )

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
