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
    bottom: 50px;
    right: 50px;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 30px 50px;
    font-size: 2em;
    font-weight: bold;
    color: white;
`

export const activate = (
    commandManager: CommandManager,
    inputManager: InputManager,
    overlayManager: OverlayManager,
) => {
    let _activeOverlay: Overlay = null
    let _currentResolveSubscription: IDisposable = null

    const isActive = () => _currentResolveSubscription !== null

    const start = () => {
        _currentResolveSubscription = inputManager.resolvers.addResolver((evt, resolution) => {
            if (_activeOverlay) {
                _activeOverlay.hide()
            }

            _activeOverlay = overlayManager.createItem()
            _activeOverlay.setContents(<KeyWrapper>{resolution}</KeyWrapper>)
            _activeOverlay.show()
            return resolution
        })
    }

    const end = () => {
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
