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
    overflow-wrap: break-word;
`
const CommandLineOutput = styled.div`
    white-space: pre-wrap; /* CRUCIAL to render white-space correctly */
    position: relative;
    border: 0px;
    background-color: rgba(0, 0, 0, 0.2);
    font-size: 1.1em;
    box-sizing: border-box;
    width: 100%;
    height: auto;
    padding: 8px;
    outline: none;
    color: white;
`

const Cursor = styled.span`
    background-color: white;
    width: 2px;
    position: absolute;
    bottom: 6px;
    height: 1.3em;
`

export interface ICommandLineRendererProps {
    visible: boolean
    content: string
    position: number
    firstchar: string
    level: number
    prompt: string
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
        }, 80)
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
        const { visible, content, position } = this.props
        const { focused, waiting } = this.state
        if (!focused && visible && this._inputElement) {
            this._inputElement.focus()
        }

        const segments = content.split("")
        const beginning = segments.slice(0, position)
        const end = segments.slice(position)

        return (
            !waiting &&
            visible && (
                <CommandLineBox>
                    <CommandLineOutput innerRef={e => (this._inputElement = e)}>
                        {this.props.firstchar}
                        {this.props.prompt}
                        {beginning}
                        <Cursor />
                        {end}
                    </CommandLineOutput>
                </CommandLineBox>
            )
        )
    }
}

const mapStateToProps = ({
    commandLine: { visible, position, content, firstchar, level, prompt },
}: State.IState) => ({
    visible,
    content,
    firstchar,
    position,
    level,
    prompt,
})

export default connect<ICommandLineRendererProps>(mapStateToProps)(CommandLine)
