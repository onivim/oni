import * as React from "react"
import { connect } from "react-redux"
import styled, { css } from "styled-components"

import * as State from "./../State"
import { fadeInAndDown } from "./animations"
import { withProps } from "./common"

const WildMenuList = styled.ul`
    width: 50%;
    position: absolute;
    left: 25%;
    top: 10%;
    max-height: 60%;
    background-color: ${p => p.theme.background};
    color: ${p => p.theme.foreground};
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    display: flex;
    padding: 1em;
    flex-direction: column;
    animation: ${fadeInAndDown} 0.05s ease-in-out;
    overflow-y: scroll;
    overflow-x: hidden;
    box-sizing: border-box;
`
const normBg = "highlight.mode.normal.background"
const normFg = "highlight.mode.normal.foreground"

const colors = css`
    background-color: ${p => p.theme[normBg]};
    color: ${p => p.theme[normFg]};
`
const WildMenuItem = withProps<{ selected: boolean }>(styled.li)`
    display: flex;
    flex: 1;
    margin: 0.2em;
    padding: 0.2em 0.5em;
    width: 100%;
    min-height: 1em;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    ${p => p.selected && colors};
`

interface Props {
    visible: boolean
    options: string[]
    selected: number
}

class WildMenu extends React.Component<Props> {
    private selectedElement: HTMLUListElement
    private containerElement: HTMLUListElement

    public componentWillReceiveProps(next: Props) {
        if (next.selected !== this.props.selected) {
            this.scrollList()
        }
    }

    public render() {
        const { visible, selected, options } = this.props

        return (
            visible && (
                <WildMenuList innerRef={e => (this.containerElement = e)}>
                    {options &&
                        options.map((option, i) => (
                            <WildMenuItem
                                innerRef={e => (i === selected ? (this.selectedElement = e) : null)}
                                selected={i === selected}
                                key={option + i}
                            >
                                {option}
                            </WildMenuItem>
                        ))}
                </WildMenuList>
            )
        )
    }

    private scrollList = () => {
        if (this.containerElement && this.selectedElement) {
            const top = this.selectedElement.offsetTop
            this.containerElement.scrollTop = top
        }
    }
}

const mapStateToProps = ({ wildmenu: { options, visible, selected } }: State.IState) => {
    return { options, visible, selected }
}

export default connect(mapStateToProps)(WildMenu)
