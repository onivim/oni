import * as React from "react"
import * as ReactDOM from "react-dom"
import { connect, Provider } from "react-redux"

import { AutoSizer, List } from "react-virtualized"

import * as Oni from "oni-api"

import styled, { getSelectedBorder } from "../../UI/components/common"
import { HighlightTextByIndex } from "./../../UI/components/HighlightText"
import { Icon, IconSize } from "./../../UI/Icon"

import { focusManager } from "./../FocusManager"

import { IMenuOptionWithHighlights, menuStore } from "./Menu"
import * as ActionCreators from "./MenuActionCreators"
import * as State from "./MenuState"
import { render as renderPinnedIcon } from "./PinnedIconView"

import { withProps } from "./../../UI/components/common"

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

const MenuStyleWrapper = styled.div`
    background-color: ${props => props.theme["menu.background"]};
    color: ${props => props.theme["menu.foreground"]};

    & input {
        color: ${props => props.theme["menu.foreground"]};
        background-color: rgba(0, 0, 0.2);
    }
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

        const footerClassName = "footer " + (this.props.isLoading ? "loading" : "loaded")

        const height =
            Math.min(this.props.items.length, this.props.maxItemsToShow) * this.props.rowHeight

        return (
            <div className="menu-background enable-mouse" onClick={this.handleHide}>
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
                    <div className={footerClassName}>
                        <div className="loading-spinner">
                            <Icon
                                name="circle-o-notch"
                                className=" fa-spin"
                                size={IconSize.Large}
                            />
                        </div>
                    </div>
                </MenuStyleWrapper>
            </div>
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

export interface IMenuItemWrapperProps {
    isSelected: boolean
}

const MenuItemWrapper = withProps<IMenuItemWrapperProps>(styled.div)`
    position: absolute;
    top: 4px;
    left: 0px;
    right: 4px;
    bottom: 4px;

    border-left: ${getSelectedBorder};

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
`

export class MenuItem extends React.PureComponent<IMenuItemProps, {}> {
    public render(): JSX.Element {
        const className = "item" + (this.props.isSelected ? " selected" : "")

        return (
            <MenuItemWrapper
                isSelected={this.props.isSelected}
                className={className}
                onClick={() => this.props.onClick()}
                style={{ height: this.props.height + "px" }}
            >
                {this.getIcon()}
                <HighlightTextByIndex
                    className="label"
                    text={this.props.label}
                    highlightIndices={this.props.labelHighlights}
                    highlightComponent={LabelHighlight}
                />
                <HighlightTextByIndex
                    className="detail"
                    text={this.props.detail}
                    highlightIndices={this.props.detailHighlights}
                    highlightComponent={DetailHighlight}
                />
                {this.props.additionalComponent}
                {renderPinnedIcon({ pinned: this.props.pinned })}
            </MenuItemWrapper>
        )
    }

    private getIcon() {
        if (!this.props.icon) {
            return <Icon name={"default"} />
        }
        if (typeof this.props.icon === "string") {
            return <Icon name={this.props.icon} />
        }
        return this.props.icon
    }
}

const LabelHighlight = styled.span`
    font-weight: bold;
    color: ${props => props.theme["highlight.mode.normal.background"]};
`

const DetailHighlight = styled.span`
    font-weight: bold;
    color: #757575;
`
