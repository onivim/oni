import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

import { fadeInAndDown } from "./animations"
import { boxShadow } from "./common"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

const CommandLineBox = styled.div`
    position: relative;
    margin-top: 16px;
    padding: 8px;
    width: 75%;
    max-width: 900px;
    background-color: ${p => p.theme["menu.background"]};
    ${boxShadow};
    animation: ${fadeInAndDown} 0.08s ease-in;
    box-sizing: border-box;
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
    visible: boolean
    content: string
    position: number
    firstchar: string
    level?: number
}

interface State {
    focused: boolean
    waiting: boolean
}

class CommandLine extends React.PureComponent<ICommandLineRendererProps, State> {
    public state = {
        focused: false,
        waiting: true,
    }
    private timer: any
    private _inputElement: HTMLInputElement

    public componentDidMount() {
        this.timer = setTimeout(() => {
            this.setState({ waiting: false })
        }, 200)
    }

    public componentWillReceiveProps(nextProps: ICommandLineRendererProps) {
        if (!this.state.focused && nextProps.visible) {
            this.setState({ focused: true })
        }
    }

    public componentWillUnmount() {
        clearTimeout(this.timer)
    }

    public render(): null | JSX.Element {
        const { visible } = this.props
        const { focused, waiting } = this.state
        if (!focused && visible && this._inputElement) {
            this._inputElement.focus()
        }

        return (
            !waiting &&
            visible && (
                <CommandLineBox>
                    <CommandLineInput
                        onChange={this.handleChange}
                        innerRef={e => (this._inputElement = e)}
                        value={this.props.firstchar + this.props.content}
                    />
                </CommandLineBox>
            )
        )
    }
    private handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        // UI.Actions.setCommandLinePosition(1, 1)
    }
}

const mapStateToProps = ({
    commandLine: { visible, position, content, firstchar, level },
}: State.IState) => ({
    visible,
    content,
    firstchar,
    position,
    level,
})

export default connect<ICommandLineRendererProps>(mapStateToProps)(CommandLine)
