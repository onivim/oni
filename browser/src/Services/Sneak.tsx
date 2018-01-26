/**
 * Sneak.tsx
 *
 * Provides the 'sneak layer' UI
 */

import * as React from "react"

import { Shapes } from "oni-api"
import { IDisposable } from "oni-types"

import { CallbackCommand, CommandManager } from "./CommandManager"

import { Overlay, OverlayManager } from "./Overlay"

import { TextInputView } from "./../UI/components/LightweightText"

export interface ISneakInfo {
    rectangle: Shapes.Rectangle
    callback: () => void
}

// TODO: Add way to explicitly add 'overlay' in Shell

export interface IAugmentedSneakInfo extends ISneakInfo {
    triggerKeys: string
}

export type SneakProvider = () => ISneakInfo[]

// TODO:
// - Add shell overlay method
// - Refactor MenuContainer to use new ShellOverlay method

export class Sneak {
    private _activeOverlay: Overlay
    private _providers: SneakProvider[] = []

    constructor(private _overlayManager: OverlayManager) {}

    public addSneakProvider(provider: SneakProvider): IDisposable {
        this._providers.push(provider)
        const dispose = () => (this._providers = this._providers.filter(prov => prov !== provider))
        return { dispose }
    }

    public show(): void {
        const rects = this._collectSneakRectangles()
        console.dir(rects)

        const augmentedRects = this._augmentSneakRectangles(rects)

        if (this._activeOverlay) {
            this._activeOverlay.hide()
            this._activeOverlay = null
        }

        this._activeOverlay = this._overlayManager.createItem()

        this._activeOverlay.setContents(
            <SneakView sneaks={augmentedRects} onComplete={info => this._onComplete(info)} />,
        )
        this._activeOverlay.show()

        // Just add overlay show / hide actions
        // const overlay = Shell.createOverlay()

        // Build up augmented sneak rectangles
        // Send to UI
    }

    private _onComplete(sneakInfo: ISneakInfo): void {
        this._activeOverlay.hide()
        sneakInfo.callback()
    }

    private _augmentSneakRectangles(sneaks: ISneakInfo[]): IAugmentedSneakInfo[] {
        return sneaks.map((sneak, idx) => {
            return {
                ...sneak,
                triggerKeys: this._getLabelFromIndex(idx, sneaks.length),
            }
        })
    }

    private _getLabelFromIndex(index: number, max: number): string {
        const firstDigit = Math.floor(index / 26)
        const secondDigit = index - firstDigit * 26
        return String.fromCharCode(97 + firstDigit, 97 + secondDigit).toUpperCase()
    }

    private _collectSneakRectangles(): ISneakInfo[] {
        const ret = this._providers.reduce((prev: ISneakInfo[], cur: SneakProvider) => {
            const sneaks = cur().filter(s => !!s)
            return [...prev, ...sneaks]
        }, [])

        return ret
    }
}

export interface ISneakViewProps {
    sneaks: IAugmentedSneakInfo[]
    onComplete: (sneakInfo: ISneakInfo) => void
}

export const TestSneaks = [
    {
        triggerKeys: "AA",
        rectangle: Shapes.Rectangle.create(10, 10, 100, 100),
        callback: () => {
            alert("testing")
        },
    },
    {
        triggerKeys: "AB",
        rectangle: Shapes.Rectangle.create(50, 50, 50, 50),
        callback: () => {
            alert("testing2")
        },
    },
]

import { OverlayWrapper } from "./../UI/components/common"

export interface ISneakViewState {
    filterText: string
}

// Render a keyboard input?
// Grab input while 'sneaking'?
export class SneakView extends React.PureComponent<ISneakViewProps, ISneakViewState> {
    constructor(props: ISneakViewProps) {
        super(props)

        this.state = {
            filterText: "",
        }
    }

    public render(): JSX.Element {
        const normalizedFilterText = this.state.filterText.toUpperCase()
        const filteredSneaks = this.props.sneaks.filter(
            sneak => sneak.triggerKeys.indexOf(normalizedFilterText) === 0,
        )
        const sneaks = filteredSneaks.map(si => <SneakItemView sneak={si} />)

        if (filteredSneaks.length === 1) {
            this.props.onComplete(filteredSneaks[0])
        }

        return (
            <OverlayWrapper>
                <TextInputView
                    onChange={evt => {
                        this.setState({ filterText: evt.currentTarget.value })
                    }}
                    backgroundColor={"black"}
                    foregroundColor={"white"}
                />
                {sneaks}
            </OverlayWrapper>
        )
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

            left: px(this.props.sneak.rectangle.x),
            top: px(this.props.sneak.rectangle.y),
            width: px(SneakItemViewSize),
            height: px(SneakItemViewSize),
        }

        return <div style={style}>{this.props.sneak.triggerKeys}</div>
    }
}

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
}

export const getInstance = (): Sneak => {
    return _sneak
}
