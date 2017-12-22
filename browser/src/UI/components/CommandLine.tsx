import * as React from "react"
import { connect } from "react-redux"
import styled, { keyframes } from "styled-components"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

const CommandLineBackground = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    background-color: rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
`

const fadeInAndDown = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`

const CommandLineBox = styled.div`
    position: relative;
    margin-top: 16px;
    padding: 8px;
    width: 75%;
    max-width: 900px;
    background-color: ${p => p.theme.background};
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    animation: ${fadeInAndDown} 0.08s ease-in;
`
const CommandLineInput = styled.input`
    border: 0px;
    background-color: rgba(0, 0, 0, 0.2);
    font-size: 1.1em;
    box-sizing: border-box;
    width: 100%;
    padding: 8px;
    outline: none;
    color: white;
`

export interface ICommandLineRendererProps {
    visible: boolean,
    content: Array<[any, string]> | null
    position: number,
    firstchar: string
    // level: number
}

class CommandLineRenderer extends React.PureComponent<ICommandLineRendererProps> {
    private _inputElement: HTMLInputElement

    public handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        // UI.Actions.setCommandLinePosition(1, 1)
    }

    public render(): null |  JSX.Element {
        if (this.props.visible && this._inputElement) {
           this._inputElement.focus()
        }

        return this.props.visible && (
            <CommandLineBackground>
                <CommandLineBox>
                    <CommandLineInput
                        onChange={this.handleChange}
                        innerRef={e => (this._inputElement = e)}
                        value={this.props.firstchar + this.props.content[0][1]}
                    />
                </CommandLineBox>
            </CommandLineBackground>
        )
    }
}

const mapStateToProps = ({ commandLine }: State.IState, props: ICommandLineRendererProps) => {
    const commandLineProps: ICommandLineRendererProps = {
        content: null,
        visible: false,
        firstchar: "",
        position: 0,
    }

    if (commandLine) {
        commandLineProps.visible = commandLine !== null
        commandLineProps.content = commandLine.content
        commandLineProps.firstchar = commandLine.firstchar
        commandLineProps.position = commandLine !== null ? commandLine.position : 0
    }

    return commandLineProps
}

export const CommandLine = connect<ICommandLineRendererProps>(mapStateToProps)(CommandLineRenderer)
