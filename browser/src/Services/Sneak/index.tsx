/**
 * Sneak/index.tsx
 *
 * Entry point for sneak functionality
 */

import { CallbackCommand, CommandManager } from "./../CommandManager"
import { OverlayManager } from "./../Overlay"

import { Sneak } from "./Sneak"

let _sneak: Sneak

export const activate = (commandManager: CommandManager, overlayManager: OverlayManager) => {
    _sneak = new Sneak(overlayManager)

    commandManager.registerCommand(
        new CallbackCommand(
            "sneak.show",
            "Sneak: Current Window",
            "Show commands for current window",
            () => {
                _sneak.show()
            },
        ),
    )

    commandManager.registerCommand(
        new CallbackCommand(
            "sneak.hide",
            "Sneak: Hide",
            "Hide sneak view",
            () => _sneak.close(),
            () => _sneak.isActive,
        ),
    )
}

export const getInstance = (): Sneak => {
    return _sneak
}
