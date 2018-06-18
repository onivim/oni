/**
 * AddressBarView.tsx
 *
 * Component to manage address bar state (whether it is focused or not)
 */

import * as React from "react"
import styled from "styled-components"

import { TextInputView } from "./../../UI/components/LightweightText"
import { Sneakable } from "./../../UI/components/Sneakable"

import { withProps } from "./../../UI/components/common"

const AddressBarWrapper = styled.div`
    width: 100%;

    height: 2.5em;
    line-height: 2.5em;

    text-align: left;
`

const EditableAddressBarWrapper = withProps<{}>(styled.div)`

    border: 1px solid ${p => p.theme["highlight.mode.insert.background"]};


    &, & input {
        background-color: ${p => p.theme["editor.background"]};
        color: ${p => p.theme["editor.foreground"]};
    }

    & input {
        margin-left: 1em;
    }
`

export interface IAddressBarViewProps {
    url: string

    onAddressChanged: (newAddress: string) => void
}

export interface IAddressBarViewState {
    isActive: boolean
}

export class AddressBarView extends React.PureComponent<
    IAddressBarViewProps,
    IAddressBarViewState
> {
    public state = {
        isActive: false,
    }

    public render(): JSX.Element {
        const contents = this.state.isActive ? this._renderTextInput() : this._renderAddressSpan()

        return <AddressBarWrapper>{contents}</AddressBarWrapper>
    }

    private _renderTextInput(): JSX.Element {
        return (
            <EditableAddressBarWrapper>
                <TextInputView
                    defaultValue={this.props.url}
                    onComplete={evt => this._onComplete(evt)}
                    onCancel={() => this._onCancel()}
                />
            </EditableAddressBarWrapper>
        )
    }

    private _renderAddressSpan(): JSX.Element {
        return (
            <Sneakable callback={() => this._setActive()} tag={"browser.address"}>
                <span onClick={() => this._setActive()}>{this.props.url}</span>
            </Sneakable>
        )
    }

    private _setActive(): void {
        this.setState({
            isActive: true,
        })
    }

    private _onCancel(): void {
        this.setState({
            isActive: false,
        })
    }

    private _onComplete(val: string): void {
        this.props.onAddressChanged(val)

        this._onCancel()
    }
}
