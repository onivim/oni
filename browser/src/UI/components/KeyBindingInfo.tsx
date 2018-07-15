/**
 * KeyBindingInfo.tsx
 *
 * Helper component to show a key binding, based on a command
 */

import styled from "styled-components"

import * as React from "react"

import { parseChordParts } from "./../../Input/KeyParser"
import { inputManager } from "./../../Services/InputManager"

export interface IKeyBindingInfoProps {
    command: string
}

const KeyWrapper = styled.span`
    color: ${props => props.theme["highlight.mode.normal.background"]};
    font-size: 0.9em;
`

export class KeyBindingInfo extends React.PureComponent<IKeyBindingInfoProps, {}> {
    public render(): JSX.Element {
        if (!inputManager) {
            return null
        }

        const boundKeys = inputManager.getBoundKeys(this.props.command)

        if (!boundKeys || !boundKeys.length) {
            return null
        }

        // 1. Get the key(s) in the chord binding
        // 2. Intersperse with "+"
        // 3. Create KeyWrappers for each segment
        return (
            <span>
                {parseChordParts(boundKeys[0])
                    .reduce((acc, chordKey) => acc.concat(chordKey, "+"), [])
                    .slice(0, -1)
                    .map((chordPart, index) => <KeyWrapper key={index}>{chordPart}</KeyWrapper>)}
            </span>
        )
    }
}

export const render = (props: IKeyBindingInfoProps) => <KeyBindingInfo {...props} />
