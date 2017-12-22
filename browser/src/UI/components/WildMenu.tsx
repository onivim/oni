import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

const WildMenuList = styled.ul`
    width: 50%;
    margin: 0 auto;
    position: absolute;
    left: 25%;
    bottom: 20%;
    background-color: ${p => p.theme.background};
    color: ${p => p.theme.foreground};
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    display: flex;
    padding: 1em;
    flex-direction: column;
`

const WildMenuItem = styled.li`
    display: flex;
    flex: 1;
`

import * as State from "./../State"

interface Props {
    visible: boolean
    options: string[]
}

class WildMenu extends React.Component<Props> {
    public render() {
        const { visible, options } = this.props
        return (
            visible && (
                <WildMenuList>
                    {options.map((option, i) => (
                        <WildMenuItem key={option + i}>{option}</WildMenuItem>
                    ))}
                </WildMenuList>
            )
        )
    }
}

const mapStateToProps = ({ wildmenu: { options, visible } }: State.IState) => {
    return { options, visible }
}

export default connect(mapStateToProps)(WildMenu)
