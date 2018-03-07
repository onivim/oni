import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"
import { withProps } from "./common"

const MenuContainer = withProps<{ loaded: boolean }>(styled.div)`
    position: absolute;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    ${p => p.loaded && `background-color: rgba(0, 0, 0, 0.25)`};
    transition: background-color 0.2s ease-in;
`

interface Props {
    commandLine: State.ICommandLine
    wildmenu: State.IWildMenu
}

class ExternalMenus extends React.Component<Props> {
    public render() {
        const { wildmenu, commandLine } = this.props
        const visible = commandLine.visible || wildmenu.visible
        return visible ? (
            <MenuContainer loaded={commandLine.visible && wildmenu.visible}>
                {this.props.children}
            </MenuContainer>
        ) : null
    }
}

const mapStateToProps = ({ wildmenu, commandLine }: State.IState) => ({
    commandLine,
    wildmenu,
})

export default connect(mapStateToProps)(ExternalMenus)
