/**
 * Sneak.tsx
 *
 * Provides the 'sneak layer' UI
 */

import { Shapes } from "oni-api"

import { CallbackCommand, CommandManager } from "./CommandManager"

export interface ISneakInfo {
    rectangle: Shapes.Rectangle
    callback: () => void
}

// TODO: Add way to explicitly add 'overlay' in Shell

export interface IAugmentedSneakInfo extends ISneakInfo {
    triggerKeys: string
}

// TODO:
// - Add shell overlay method
// - Refactor MenuContainer to use new ShellOverlay method

export class Sneak {

    public show(): void {
        const rects = this._collectSneakRectangles

        // Just add overlay show / hide actions
        // const overlay = Shell.createOverlay()

        // Build up augmented sneak rectangles
        // Send to UI
    }

    private _collectSneakRectangles(): ISneakInfo[] {
        return [{
            rectangle: Shapes.Rectangle.create(10, 10, 100, 100),
            callback: () => { alert("testing") }
        ]
    }
}

let _sneak: Sneak

export const activate = (commandManager: CommandManager) => {
    _sneak = new Sneak()

    commandManager.registerCommand(new CallbackCommand(
        "sneak.showActiveWindow",
        "Sneak: Current Window",
        "Show commands for current window",
        () => { _sneak.show() }
    ))
}
