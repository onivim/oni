import * as React from "react"
import { connect } from "react-redux"
import styled, { css } from "styled-components"
import { Icon } from "./../../UI/Icon"

import { fadeInAndDown } from "./animations"
import { boxShadow, withProps } from "./common"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

const WildMenuList = styled.ul`
    position: relative;
    width: 75%;
    max-height: 30em;
    max-width: 900px;
    animation: ${fadeInAndDown} 0.05s ease-in-out;
    display: flex;
    padding: 1em;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
    background-color: ${p => p.theme["menu.background"]};
    color: ${p => p.theme["menu.foreground"]};
    ${boxShadow};
`
const colors = css`
    background-color: rgba(0, 0, 0, 0.2);
    color: ${p => p.theme["menu.foreground"]};
`
const WildMenuItem = withProps<{ selected: boolean }>(styled.li)`
    font-size: 1.1rem;
    margin: 0.2em;
    padding: 0.4em;
    ${p => p.selected && boxShadow};
    min-height: 1rem;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    ${p => p.selected && colors};
`

const WildMenuText = styled.span`
    margin-left: 1rem;
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
                                <span>
                                    <Icon name="file-text" />
                                </span>
                                <WildMenuText>{option}</WildMenuText>
                            </WildMenuItem>
                        ))}
                </WildMenuList>
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
