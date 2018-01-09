import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

import { Icon, OcticonIcon } from "./../../UI/Icon"
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

const IconContainer = styled.span`
    margin-right: 0.5em;
`

const ArrowContainer = styled.span`
    font-size: 0.7em;
    margin-right: 0.6em;
`

const SelectorSpan = styled.span`
    display: inline-flex;
`

export interface ICommandLineRendererProps {
    showIcons: boolean
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

interface ICommandlineIconProps {
    name: any
    arrow?: boolean
    octicon?: boolean
}

const CommandLineIcon = ({ arrow, name, octicon }: ICommandlineIconProps) => {
    switch (true) {
        case arrow:
            return (
                <span>
                    <ArrowContainer>
                        <Icon name={name} />
                    </ArrowContainer>
                </span>
            )
        case octicon:
            return (
                <SelectorSpan>
                    <OcticonIcon name={name} />
                </SelectorSpan>
            )
        default:
            return <Icon name={name} />
    }
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

    public renderIconOrChar(character: string) {
        if (!this.props.showIcons) {
            return character
        }
        switch (character) {
            case "/":
                return [
                    <CommandLineIcon name="search" key={`${character}-search`} />,
                    <CommandLineIcon arrow name="arrow-right" key={`${character}-arrow-right`} />,
                ]
            case "?":
                return [
                    <CommandLineIcon name="search" key={`${character}-search`} />,
                    <CommandLineIcon key={`${character}-arrow-left`} arrow name="arrow-left" />,
                ]
            default:
                return character
        }
    }

    public componentWillUnmount() {
        clearTimeout(this.timer)
    }

    public render(): null | JSX.Element {
        const { visible, content, position, firstchar } = this.props
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
                        {this.renderIconOrChar(firstchar)}
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

const mapStateToProps = ({ commandLine, configuration }: State.IState) => {
    const { visible, position, content, firstchar, level, prompt } = commandLine
    return {
        showIcons: configuration["experimental.commandline.icons"],
        visible,
        content,
        firstchar,
        position,
        level,
        prompt,
    }
}

export default connect<ICommandLineRendererProps>(mapStateToProps)(CommandLine)
