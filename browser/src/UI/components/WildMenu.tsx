import * as React from "react"
import { connect } from "react-redux"
import styled, { css } from "styled-components"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"
import { fadeInAndDown } from "./animations"
import { boxShadow, withProps } from "./common"

const WildMenuContainer = styled.div`
    width: 50%;
    position: absolute;
    left: 25%;
    top: 10%;
    overflow: hidden;
    box-sizing: border-box;
    max-height: 500px;
    display: flex;
    align-items: center;
`

const WildMenuList = styled.ul`
    height: 90%;
    width: 100%;
    background-color: ${p => p.theme.background};
    ${boxShadow} animation: ${fadeInAndDown} 0.05s ease-in-out;
    color: ${p => p.theme.foreground};
    display: flex;
    padding: 1em;
    flex-direction: column;
    box-sizing: border-box;
    overflow-y: scroll;
    overflow-x: hidden;
`
const normBg = "highlight.mode.normal.background"
const normFg = "highlight.mode.normal.foreground"

const colors = css`
    background-color: ${p => p.theme[normBg]};
    color: ${p => p.theme[normFg]};
`
const WildMenuItem = withProps<{ selected: boolean }>(styled.li)`
    font-size: 1.1em;
    display: inline;
    margin: 0.2em;
    padding: 0.2em 0 0.5em 0.2em;
    ${p => p.selected && boxShadow};
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

interface State {
    currentPage: number
    itemsPerPage: number
}

class WildMenu extends React.Component<Props, State> {
    public state = {
        currentPage: 1,
        itemsPerPage: 10,
    }
    private selectedElement: HTMLUListElement
    private containerElement: HTMLUListElement

    public componentWillReceiveProps(next: Props) {
        if (next.selected !== this.props.selected) {
            let currentPage = Math.floor(next.selected / this.state.itemsPerPage) + 1
            currentPage = currentPage || 1
            this.setState({ currentPage })
        }
    }

    public render() {
        const { visible } = this.props
        const { currentItems, current } = this.calculateCurrentItems()

        return (
            visible && (
                <WildMenuContainer>
                    <WildMenuList innerRef={e => (this.containerElement = e)}>
                        {currentItems &&
                            currentItems.map((option, i) => (
                                <WildMenuItem
                                    innerRef={e =>
                                        i === current - 1 ? (this.selectedElement = e) : null
                                    }
                                    selected={i === current}
                                    key={option + i}
                                >
                                    {option}
                                </WildMenuItem>
                            ))}
                    </WildMenuList>
                </WildMenuContainer>
            )
        )
    }

    private calculateCurrentItems() {
        const { options, selected } = this.props
        const { currentPage, itemsPerPage } = this.state
        const indexOfLastItem = currentPage * itemsPerPage
        const indexOfFirstItem = indexOfLastItem - itemsPerPage
        const currentItems = options.slice(indexOfFirstItem, indexOfLastItem)
        const current = selected - itemsPerPage * (currentPage - 1)
        return { current, currentItems }
    }
}

const mapStateToProps = ({ wildmenu: { options, visible, selected } }: State.IState) => {
    return { options, visible, selected }
}

export default connect(mapStateToProps)(WildMenu)
