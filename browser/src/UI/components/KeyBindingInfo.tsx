/**
 * KeyBindingInfo.tsx
 *
 * Helper component to show a key binding, based on a command
 */

import styled from "styled-components"
import { withProps } from "./common"

import * as React from "react"

import { inputManager } from "./../../Services/InputManager"

export interface IKeyBindingInfoProps {
    command: string
}

const KeyWrapper = styled.div`
    color: ${props => props.theme["highlight.mode.normal.background"]};
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

        const parsedKeys = inputManager.parseKeys(boundKeys[0])

        if (!parsedKeys || !parsedKeys.chord || !parsedKeys.chord.length) {
            return null
        }

        const firstChord = parsedKeys.chord[0]

        const elems: JSX.Element[] = []

        if (firstChord.meta) {
            elems.push(<KeyWrapper>{"Meta"}</KeyWrapper>)
            elems.push(<KeyWrapper>{"+"}</KeyWrapper>)
        }

        if (firstChord.control) {
            elems.push(<KeyWrapper>{"Control"}</KeyWrapper>)
            elems.push(<KeyWrapper>{"+"}</KeyWrapper>)
        }

        if (firstChord.alt) {
            elems.push(<KeyWrapper>{"Alt"}</KeyWrapper>)
            elems.push(<KeyWrapper>{"+"}</KeyWrapper>)
        }

        if (firstChord.shift) {
            elems.push(<KeyWrapper>{"Shift"}</KeyWrapper>)
            elems.push(<KeyWrapper>{"+"}</KeyWrapper>)
        }

        elems.push(<KeyWrapper>{firstChord.character}</KeyWrapper>)

        return <span>{elems}</span>
    }
}

export const render = (props: IKeyBindingInfoProps) => <KeyBindingInfo {...props} />
