import * as React from "react"
import * as ReactDOM from "react-dom"
import { connect, Provider } from "react-redux"

import { AutoSizer, List } from "react-virtualized"

import * as Oni from "oni-api"

import { HighlightTextByIndex } from "./../../UI/components/HighlightText"
import { Icon, IconSize } from "./../../UI/Icon"

import { focusManager } from "./../FocusManager"

import { IMenuOptionWithHighlights, menuStore } from "./Menu"
import * as ActionCreators from "./MenuActionCreators"
import * as State from "./MenuState"

import styled, { boxShadow, fontSizeSmall, withProps } from "./../../UI/components/common"

import { TextInputView } from "./../../UI/components/LightweightText"

export interface IMenuProps {
    visible: boolean
    selectedIndex: number
    filterText: string
    onChangeFilterText: (text: string) => void
    onSelect: (selectedIndex?: number) => void
    onHide: () => void
    items: IMenuOptionWithHighlights[]
    isLoading: boolean

    rowHeight: number
    maxItemsToShow: number
}

const MenuBackground = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    background-color: rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: auto;
`

const MenuStyleWrapper = styled.div`
    position: relative;
    margin-top: 16px;
    padding: 8px;
    width: 75%;
    max-width: 900px;
    background-color: ${props => props.theme["menu.background"]};
    color: ${props => props.theme["menu.foreground"]};
    ${boxShadow};

    & input {
        color: ${props => props.theme["menu.foreground"]};
        border: 0px;
        background-color: rgba(0, 0, 0, 0.2);
        font-size: 1.1em;
        box-sizing: border-box;
        width: 100%;
        padding: 8px;
        outline: none;
    }
`

interface IFooterProps {
    isLoading: boolean
}
const Footer = withProps<IFooterProps>(styled.div)`
    text-align: center;
    width: 100%;
    transition-property: transform, opacity;
    transition-duration: 0.5s;
    position: absolute;
    bottom: 0px;
    height: 3em;
    margin-left: -8px;
    ${boxShadow};

    // Put behind items / menu element
    z-index: -1;

    opacity: ${props => (props.isLoading ? "1" : "0")};
    transform: ${props => (props.isLoading ? "translateY(100%)" : "translateY(0%)")};
`

interface ILoadingSpinnerProps {
    isLoading: boolean
}
const LoadingSpinner = withProps<ILoadingSpinnerProps>(styled.div)`
    line-height: 3em;
    height: 3em;

    opacity: ${props => (props.isLoading ? "1" : "0")};
`

export class MenuView extends React.PureComponent<IMenuProps, {}> {
    private _inputElement: HTMLInputElement = null
    private _popupBody: Element = null

    public componentWillUpdate(newProps: Readonly<IMenuProps>): void {
        if (newProps.visible !== this.props.visible && !newProps.visible && this._inputElement) {
            focusManager.popFocus(this._inputElement)
        }
    }

    public render(): null | JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const rowRenderer = (props: { key: string; index: number; style: React.CSSProperties }) => {
            const item = this.props.items[props.index]
            return (
                <div style={props.style} key={props.key}>
                    <MenuItem
                        {...item as any}
                        key={props.key}
                        filterText={this.props.filterText}
                        isSelected={props.index === this.props.selectedIndex}
                        onClick={() => this.props.onSelect(props.index)}
                    />
                </div>
            )
        }

        const height =
            Math.min(this.props.items.length, this.props.maxItemsToShow) * this.props.rowHeight

        return (
            <MenuBackground onClick={this.handleHide}>
                <MenuStyleWrapper
                    className="menu"
                    innerRef={elem => {
                        this._popupBody = elem
                    }}
                >
                    <TextInputView onChange={evt => this._onChange(evt)} />
                    <div className="items">
                        <div>
                            <AutoSizer disableHeight={true}>
                                {({ width }) => (
                                    <List
                                        scrollToIndex={this.props.selectedIndex}
                                        width={width}
                                        height={height}
                                        rowCount={this.props.items.length}
                                        rowHeight={this.props.rowHeight}
                                        rowRenderer={rowRenderer}
                                    />
                                )}
                            </AutoSizer>
                        </div>
                    </div>
                    <Footer isLoading={this.props.isLoading}>
                        <LoadingSpinner isLoading={this.props.isLoading}>
                            <Icon
                                name="circle-o-notch"
                                className=" fa-spin"
                                size={IconSize.Large}
                            />
                        </LoadingSpinner>
                    </Footer>
                </MenuStyleWrapper>
            </MenuBackground>
        )
    }

    private _onChange(evt: React.FormEvent<HTMLInputElement>) {
        const target: any = evt.target
        this.props.onChangeFilterText(target.value)
    }

    /**
     * Hide the popup if a click event was registered outside of it
     */
    private handleHide = (event: any) => {
        const node = ReactDOM.findDOMNode(this._popupBody)
        if (!node.contains(event.target as Node)) {
            this.props.onHide()
        }
    }
}

const EmptyArray: any[] = []
const noop = () => {} // tslint:disable-line
const NullProps: any = {
    visible: false,
    selectedIndex: 0,
    filterText: "",
    items: EmptyArray,
    onSelect: noop,
    isLoading: true,
    rowHeight: 0,
    maxItemsToShow: 0,
}

const mapStateToProps = (
    state: State.IMenus<Oni.Menu.MenuOption, IMenuOptionWithHighlights>,
): any => {
    if (!state.menu) {
        return NullProps
    } else {
        const popupMenu = state.menu
        return {
            visible: true,
            selectedIndex: popupMenu.selectedIndex,
            filterText: popupMenu.filter,
            items: popupMenu.filteredOptions,
            onSelect: popupMenu.onSelectItem,
            isLoading: popupMenu.isLoading,
            rowHeight: state.configuration.rowHeight,
            maxItemsToShow: state.configuration.maxItemsToShow,
        }
    }
}

const mapDispatchToProps = {
    onChangeFilterText: ActionCreators.filterMenu,
    onHide: ActionCreators.hidePopupMenu,
}

export const ConnectedMenu: any = connect(mapStateToProps, mapDispatchToProps)(MenuView)

export const MenuContainer = () => {
    return (
        <Provider store={menuStore}>
            <ConnectedMenu />
        </Provider>
    )
}

export interface IMenuItemWrapperProps {
    isSelected: boolean
}

const menuItemHighlightBackgroundColor = "background-color: rgba(0, 0, 0, 0.1);"
const MenuItemWrapper = withProps<IMenuItemWrapperProps>(styled.div)`
    position: absolute;
    top: 4px;
    left: 0px;
    right: 4px;
    bottom: 4px;

    border-left: ${props =>
        props.isSelected
            ? "4px solid " + props.theme["highlight.mode.normal.background"]
            : "4px solid transparent"};
    ${props => (props.isSelected ? menuItemHighlightBackgroundColor : "")};
    :hover {
        ${menuItemHighlightBackgroundColor}
    }

    display: flex;
    flex-direction: row;
    align-items: center;

    user-select: none;
    -webkit-user-drag:none;
    cursor: pointer;
    font-size: 1em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    & .fa:not(.fa-spin) {
        padding-left: 4px;
        padding-right: 4px;
    }
`

const Label = styled(HighlightTextByIndex)`
    margin: 4px;
    padding-right: 8px;
`

const LabelHighlight = styled.span`
    font-weight: bold;
    color: ${props => props.theme["highlight.mode.normal.background"]};
`

const Detail = styled(HighlightTextByIndex)`
    ${fontSizeSmall};
    color: #646464;
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 8px;
`

const DetailHighlight = styled.span`
    font-weight: bold;
    color: #757575;
`

export interface IMenuItemProps {
    icon?: string | JSX.Element
    isSelected: boolean
    filterText: string
    label: string
    labelHighlights: number[]
    detail: string
    detailHighlights: number[]
    pinned: boolean
    additionalComponent?: JSX.Element
    onClick: () => void
    height: number
}

export const MenuItem = ({
    icon,
    isSelected,
    filterText,
    label,
    labelHighlights,
    detail,
    detailHighlights,
    pinned,
    additionalComponent,
    onClick,
    height,
}: IMenuItemProps) => {
    const iconToUse = icon ? (
        typeof icon === "string" ? (
            <Icon name={icon} />
        ) : (
            icon
        )
    ) : (
        <Icon name={"default"} />
    )

    return (
        <MenuItemWrapper
            isSelected={isSelected}
            onClick={() => onClick()}
            style={{ height: height + "px" }}
        >
            {iconToUse}
            <Label
                text={label}
                highlightIndices={labelHighlights}
                highlightComponent={LabelHighlight}
            />
            <Detail
                text={detail}
                highlightIndices={detailHighlights}
                highlightComponent={DetailHighlight}
            />
            {additionalComponent}
        </MenuItemWrapper>
    )
}
