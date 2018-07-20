import * as React from "react"

import styled from "./../../components/common"
import TextInput from "./../LightweightText"

export const Explainer = styled.span`
    width: 100%;
    padding-left: 0.5rem;
    text-align: left;
    font-size: 0.8em;
    display: block;
    opacity: 0.4;
`

const TextArea = styled.textarea`
    width: 100%;
    background-color: inherit;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    padding: 0.5em;
    box-sizing: border-box;
    overflow: hidden;
    resize: vertical;
`
export interface ICommitHandlers {
    handleCommitMessage: (evt: React.ChangeEvent<HTMLInputElement>) => void
    handleCommitCancel: () => void
    handleCommitComplete: () => void
}

const CommitMessage: React.SFC<ICommitHandlers> = props => (
    <>
        <Explainer>Hit enter to commit the file</Explainer>
        <TextInput
            InputComponent={TextArea}
            onChange={props.handleCommitMessage}
            onCancel={props.handleCommitCancel}
            onComplete={props.handleCommitComplete}
            defaultValue="Enter a commit message"
        />
    </>
)
export default CommitMessage
