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
const CommandLineOutput = styled.div`
    position: relative;
    border: 0px;
    background-color: rgba(0, 0, 0, 0.2);
    font-size: 1.1em;
    box-sizing: border-box;
    width: 100%;
    padding: 8px;
    outline: none;
    color: white;
`

const Cursor = styled.span`
  background-color: white;
  width: 2px;
  position: absolute;
  top: 8px;
  height: 60%;
`

export interface ICommandLineRendererProps {
    visible: boolean
    content: string
    position: number
    firstchar: string
    level?: number
}

interface State {
    waiting: boolean
}

class CommandLine extends React.PureComponent<ICommandLineRendererProps, State> {
    public state = {
        waiting: true,
    }
    private timer: any
    private _inputElement: HTMLInputElement

    public componentDidMount() {
        this.timer = setTimeout(() => {
            this.setState({ waiting: false })
        }, 200)
    }

    public componentWillUnmount() {
        clearTimeout(this.timer)
    }

    public render(): null | JSX.Element {
        const { visible, content, position } = this.props
        const {  waiting } = this.state

        const stringArray = content.split("")
        const beginning = stringArray.slice(0, position)
        const end = stringArray.slice(position)

        return (
            !waiting &&
            visible && (
                <CommandLineBox>
                    <CommandLineOutput innerRef={e => (this._inputElement = e)}>
                        {this.props.firstchar}
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
    commandLine: { visible, position, content, firstchar, level },
}: State.IState) => ({
    visible,
    content,
    firstchar,
    position,
    level,
})

export default connect<ICommandLineRendererProps>(mapStateToProps)(CommandLine)
