/**
 * SearchTextBox.tsx
 *
 * Component for textbox in search
 */

import * as React from "react"

import styled from "styled-components"
import { boxShadow, withProps } from "./../../UI/components/common"
import { TextInputView } from "./../../UI/components/LightweightText"

export interface ISearchTextBoxProps {
    isActive: boolean
    isFocused: boolean
    val: string

    onDismiss: () => void
    onCommit: (newValue: string) => void
    onChangeText: (newValue: string) => void
    onClick: () => void
}

const SearchBoxContainerWrapper = withProps<ISearchTextBoxProps>(styled.div)`
    padding: 8px;

    background-color: ${props => (props.isFocused ? "rgba(0, 0, 0, 0.1)" : "transparent")};
    border-left: 2px solid ${props =>
        props.isFocused ? props.theme["highlight.mode.normal.background"] : "transparent"};
`

const SearchTextBoxWrapper = withProps<ISearchTextBoxProps>(styled.div)`
    padding: 8px;
    border: ${props =>
        props.isActive
            ? "2px solid " + props.theme["highlight.mode.normal.background"]
            : "1px solid " + props.theme["editor.foreground"]};
    margin: 8px;
    background-color: ${props => props.theme.background};

    ${props => (props.isActive ? boxShadow : "")};

    transition: all 0.1s ease-in;

    input {
        background-color: transparent;
        color: ${props => props.theme["editor.foreground"]}
    }

    cursor: text;
`

export class SearchTextBox extends React.PureComponent<ISearchTextBoxProps, {}> {
    public render(): JSX.Element {
        const inner = this.props.isActive ? (
            <TextInputView
                defaultValue={this.props.val}
                onCancel={this.props.onDismiss}
                onChange={elem => this.props.onChangeText(elem.currentTarget.value)}
                onComplete={this.props.onCommit}
            />
        ) : (
            <div>{this.props.val}</div>
        )
        return (
            <SearchBoxContainerWrapper {...this.props} onClick={this.props.onClick}>
                <SearchTextBoxWrapper {...this.props}>{inner}</SearchTextBoxWrapper>
            </SearchBoxContainerWrapper>
        )
    }
}
