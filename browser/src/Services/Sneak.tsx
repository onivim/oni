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

export interface IAugmentedSneakInfo extends ISneakInfo {
    triggerKeys: string
}

export type SneakProvider = () => ISneakInfo[]

export class Sneak {
    private _activeOverlay: Overlay
    private _providers: SneakProvider[] = []

    constructor(private _overlayManager: OverlayManager) {}

    public get isActive(): boolean {
        return !!this._activeOverlay
    }

    public addSneakProvider(provider: SneakProvider): IDisposable {
        this._providers.push(provider)
        const dispose = () => (this._providers = this._providers.filter(prov => prov !== provider))
        return { dispose }
    }

    public show(): void {
        const rects = this._collectSneakRectangles()

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
    }

    public close(): void {
        if (this._activeOverlay) {
            this._activeOverlay.hide()
            this._activeOverlay = null
        }
    }

    private _onComplete(sneakInfo: ISneakInfo): void {
        this.close()
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

import { boxShadow, OverlayWrapper } from "./../UI/components/common"

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
        const sneaks = filteredSneaks.map(si => (
            <SneakItemView sneak={si} filterLength={normalizedFilterText.length} />
        ))

        if (filteredSneaks.length === 1) {
            this.props.onComplete(filteredSneaks[0])
        }

        return (
            <OverlayWrapper style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
                <div style={{ opacity: 0.01 }}>
                    <TextInputView
                        onChange={evt => {
                            this.setState({ filterText: evt.currentTarget.value })
                        }}
                        backgroundColor={"black"}
                        foregroundColor={"white"}
                    />
                </div>
                {sneaks}
            </OverlayWrapper>
        )
    }
}

export interface ISneakItemViewProps {
    sneak: IAugmentedSneakInfo
    filterLength: number
}

import styled from "styled-components"

const SneakItemWrapper = styled.div`
    ${boxShadow} background-color: ${props => props.theme["highlight.mode.visual.background"]};
    color: ${props => props.theme["highlight.mode.visual.foreground"]};
`

const SneakItemViewSize = 20
const px = (num: number): string => num.toString() + "px"
export class SneakItemView extends React.PureComponent<ISneakItemViewProps, {}> {
    public render(): JSX.Element {
        const style: React.CSSProperties = {
            position: "absolute",
            left: px(this.props.sneak.rectangle.x),
            top: px(this.props.sneak.rectangle.y),
            width: px(SneakItemViewSize),
            height: px(SneakItemViewSize),
        }

        return (
            <SneakItemWrapper style={style}>
                <span style={{ fontWeight: "bold" }}>
                    {this.props.sneak.triggerKeys.substring(0, this.props.filterLength)}
                </span>
                <span>
                    {this.props.sneak.triggerKeys.substring(
                        this.props.filterLength,
                        this.props.sneak.triggerKeys.length,
                    )}
                </span>
            </SneakItemWrapper>
        )
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
