/**
 * KeyDisplayer
 *
 * Utility for showing keys while typing
 */

import * as React from "react"
import styled from "styled-components"

import { IDisposable } from "oni-types"

import { CommandManager } from "./CommandManager"
import { InputManager } from "./InputManager"
import { Overlay, OverlayManager } from "./Overlay"

const KeyWrapper = styled.div`
    position: absolute;
    right: 50px;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 30px 50px;
    font-size: 2em;
    font-weight: bold;
    color: white;
`

export interface IKeyDisplayerViewProps {
    keys: IKeyPressInfo[]
}

const EmptyArray: IKeyPressInfo[] = []

const WindowToShow = 500
const WindowToCoalesce = 100

export class KeyDisplayerView extends React.PureComponent<IKeyDisplayerViewProps, {}> {
    public render(): JSX.Element {
        const currentTime = new Date().getTime()

        const keys = this.props.keys || EmptyArray
        const activeKeys = keys
            .filter(key => currentTime - key.timeInMilliseconds < WindowToShow)
            .sort((a, b) => a.timeInMilliseconds - b.timeInMilliseconds)

        const coalescedKeys = activeKeys.reduce<IKeyPressInfo[][]>(
            (prev: IKeyPressInfo[][], cur) => {
                const lastGroup = prev[prev.length - 1]
                if (lastGroup.length === 0) {
                    return [...prev, [cur]]
                } else {
                    const lastItemInLastGroup = lastGroup[lastGroup.length - 1]
                    if (
                        Math.abs(lastItemInLastGroup.timeInMilliseconds - cur.timeInMilliseconds) <
                        WindowToCoalesce
                    ) {
                        // Avoid duplicates..
                        if (cur.key !== lastItemInLastGroup.key) {
                            lastGroup.push(cur)
                        }

                        return prev
                    } else {
                        return [...prev, [cur]]
                    }
                }
            },
            [[]],
        )

        const sanitizedKeys = coalescedKeys.filter(group => group.length > 0)

        const keyElements = sanitizedKeys.map((k, idx) => (
            <KeyWrapper style={{ bottom: 50 + 50 * idx + "px" }}>
                {k.reduce<string>((prev: string, cur: IKeyPressInfo) => prev + cur.key, "")}
            </KeyWrapper>
        ))

        return <div>{keyElements}</div>
    }
}

export interface IKeyPressInfo {
    timeInMilliseconds: number
    key: string
}

export const activate = (
    commandManager: CommandManager,
    inputManager: InputManager,
    overlayManager: OverlayManager,
) => {
    let _activeOverlay: Overlay = null
    let _currentResolveSubscription: IDisposable = null
    let _keys: IKeyPressInfo[] = []

    const isActive = () => _currentResolveSubscription !== null

    const start = () => {
        _currentResolveSubscription = inputManager.resolvers.addResolver((evt, resolution) => {
            if (_activeOverlay) {
                _activeOverlay.hide()
            }

            _keys.push({
                timeInMilliseconds: new Date().getTime(),
                key: resolution,
            })

            _activeOverlay = overlayManager.createItem()
            _activeOverlay.setContents(<KeyDisplayerView keys={_keys} />)
            _activeOverlay.show()
            return resolution
        })
    }

    const end = () => {
        _keys = []
        if (_currentResolveSubscription) {
            _currentResolveSubscription.dispose()
            _currentResolveSubscription = null
        }
    }

    commandManager.registerCommand({
        command: "keyDisplayer.show",
        name: "Input: Show key presses",
        detail: "Show typed keys in an overlay.",
        execute: start,
        enabled: () => !isActive(),
    })

    commandManager.registerCommand({
        command: "keyDisplayer.hide",
        name: "Input: Hide key presses",
        detail: "Turn off visible typing.",
        execute: end,
        enabled: () => isActive(),
    })
}
