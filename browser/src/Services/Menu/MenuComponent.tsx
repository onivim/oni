import * as React from "react"
import { connect, Provider } from "react-redux"

import styled from "styled-components"

import { AutoSizer, List } from "react-virtualized"

import * as Oni from "oni-api"

import { HighlightTextByIndex } from "./../../UI/components/HighlightText"
// import { Visible } from "./../../UI/components/Visible"
import { Icon, IconSize } from "./../../UI/Icon"

import { focusManager } from "./../FocusManager"

import { IMenuOptionWithHighlights, menuStore } from "./Menu"
import * as ActionCreators from "./MenuActionCreators"
import * as State from "./MenuState"

import { withProps } from "./../../UI/components/common"

import { TextInputView } from "./../../UI/components/LightweightText"

export interface IMenuProps {
    visible: boolean
    selectedIndex: number
    filterText: string
    onChangeFilterText: (text: string) => void
    onSelect: (selectedIndex?: number) => void
    items: IMenuOptionWithHighlights[]
    isLoading: boolean

    rowHeight: number
    maxItemsToShow: number

    backgroundColor: string
    foregroundColor: string
}

export class MenuView extends React.PureComponent<IMenuProps, {}> {
    private _inputElement: HTMLInputElement = null

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
                <div style={props.style}>
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

        const menuStyle = {
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
        }

        const footerClassName = "footer " + (this.props.isLoading ? "loading" : "loaded")

        const height =
            Math.min(this.props.items.length, this.props.maxItemsToShow) * this.props.rowHeight

        return (
            <div className="menu-background enable-mouse">
                <div className="menu" style={menuStyle}>
                    <TextInputView
                        overrideDefaultStyle={true}
                        backgroundColor={null}
                        foregroundColor={this.props.foregroundColor}
                        onChange={evt => this._onChange(evt)}
                    />
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
                    <div className={footerClassName} style={menuStyle}>
                        <div className="loading-spinner">
                            <Icon
                                name="circle-o-notch"
                                className=" fa-spin"
                                size={IconSize.Large}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    private _onChange(evt: React.FormEvent<HTMLInputElement>) {
        const target: any = evt.target
        this.props.onChangeFilterText(target.value)
    }
}

const EmptyArray: any[] = []
const noop = () => {} // tslint:disable-line
const NullProps: any = {
    visible: false,
    selectedIndex: 0,
    filterText: "",
    items: EmptyArray,
    backgroundColor: "black",
    foregroundColor: "white",
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
            backgroundColor: popupMenu.backgroundColor,
            foregroundColor: popupMenu.foregroundColor,
            onSelect: popupMenu.onSelectItem,
            isLoading: popupMenu.isLoading,
            rowHeight: state.configuration.rowHeight,
            maxItemsToShow: state.configuration.maxItemsToShow,
        }
    }
}

const mapDispatchToProps = (dispatch: any): any => {
    const dispatchFilterText = (text: string) => {
        dispatch(ActionCreators.filterMenu(text))
    }

    return {
        onChangeFilterText: dispatchFilterText,
    }
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

    border-left: ${props =>
        props.isSelected
            ? "4px solid " + props.theme["highlight.mode.normal.background"]
            : "4px solid transparent"};

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
        let className = "item"

        if (this.props.isSelected) {
            className += " selected"
        }

        const icon =
            this.props.icon && typeof this.props.icon === "string" ? (
                <Icon name={this.props.icon} />
            ) : (
                this.props.icon
            )
        return (
            <MenuItemWrapper
                isSelected={this.props.isSelected}
                className={className}
                onClick={() => this.props.onClick()}
                style={{ height: this.props.height + "px" }}
            >
                {icon}
                <HighlightTextByIndex
                    className="label"
                    text={this.props.label}
                    highlightIndices={this.props.labelHighlights}
                    highlightClassName={"highlight"}
                />
                <HighlightTextByIndex
                    className="detail"
                    text={this.props.detail}
                    highlightIndices={this.props.detailHighlights}
                    highlightClassName={"highlight"}
                />
            </MenuItemWrapper>
        )
    }
}
