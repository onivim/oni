/**
 * Sneak.tsx
 *
 * Provides the 'sneak layer' UI
 */

import * as React from "react"

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
        console.dir(rects)

        // Just add overlay show / hide actions
        // const overlay = Shell.createOverlay()

        // Build up augmented sneak rectangles
        // Send to UI
    }

    private _collectSneakRectangles(): ISneakInfo[] {
        return [{
            rectangle: Shapes.Rectangle.create(10, 10, 100, 100),
            callback: () => { alert("testing") }
        }]
    }
}

export interface ISneakViewProps {
    sneaks: IAugmentedSneakInfo[]
}

export const TestSneaks = [{
    triggerKeys: "AA",
    rectangle: Shapes.Rectangle.create(10, 10, 100, 100),
    callback: () => { alert("testing") }
}]

import { Overlay } from "./../UI/components/common"

// Render a keyboard input?
// Grab input while 'sneaking'?
export class SneakView extends React.PureComponent<ISneakViewProps, {}> {

    public render(): JSX.Element {
        const sneaks = this.props.sneaks.map((si) => <SneakItemView sneak={si} />)

        return <Overlay>
                {sneaks}
            </Overlay>
    }
}

export interface ISneakItemViewProps {
    sneak: IAugmentedSneakInfo
}

const SneakItemViewSize = 20
const px = (num: number): string => num.toString() + "px"
export class SneakItemView extends React.PureComponent<ISneakItemViewProps, {}> {
    public render(): JSX.Element {
        const style: React.CSSProperties = {
            position: "absolute",

            backgroundColor: "red",

            left: px(this.props.sneak.rectangle.x - SneakItemViewSize / 2),
            top: px(this.props.sneak.rectangle.y - SneakItemViewSize / 2),
            width: px(SneakItemViewSize),
            height: px(SneakItemViewSize),
        }

        return <div style={style}>{this.props.sneak.triggerKeys}</div>
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
