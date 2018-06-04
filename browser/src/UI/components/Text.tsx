import * as React from "react"

import styled from "./common"

export interface ITextProps {
    text: string
}

const Selected = styled.span`
    font-style: italic;
    text-decoration: underline;
`

export const Text = (props: ITextProps) => <span>{props.text}</span>

export const SelectedText = (props: ITextProps) => <Selected>{props.text}</Selected>
