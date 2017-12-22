import * as React from "react"
import { connect } from "react-redux"
import styled, { css } from "styled-components"

import { withProps } from "./common"

const WildMenuList = styled.ul`
    width: 50%;
    margin: 0 auto;
    position: absolute;
    left: 25%;
    bottom: 20%;
    max-height: 30%;
    background-color: ${p => p.theme.background};
    color: ${p => p.theme.foreground};
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    display: flex;
    padding: 1em;
    flex-direction: column;
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
    width: 100%;
    text-align: left;
    padding-left: 0.5em;
    ${p => p.selected && colors};
`

import * as State from "./../State"

interface Props {
    visible: boolean
    options: string[]
    selected: number
}

class WildMenu extends React.Component<Props> {
    public render() {
        const { visible, options } = this.props
        return (
            visible && (
                <WildMenuList>
                    {options &&
                        options.map((option, i) => (
                            <WildMenuItem selected={i === this.props.selected} key={option + i}>
                                {option}
                            </WildMenuItem>
                        ))}
                </WildMenuList>
            )
        )
    }
}

const mapStateToProps = ({ wildmenu: { options, visible, selected } }: State.IState) => {
    return { options, visible, selected }
}

export default connect(mapStateToProps)(WildMenu)
