import * as React from "react"
import { connect, Provider } from "react-redux"

import { List } from "react-virtualized"

import * as Oni from "oni-api"

import { HighlightTextByIndex } from "./../../UI/components/HighlightText"
import { Visible } from "./../../UI/components/Visible"
import { Icon, IconSize } from "./../../UI/Icon"

import { focusManager } from "./../FocusManager"

import { IMenuOptionWithHighlights, menuStore } from "./Menu"
import * as ActionCreators from "./MenuActionCreators"
import * as State from "./MenuState"

import { TextInputView } from "./../../UI/components/LightweightText"

export interface IMenuProps {
    visible: boolean
    selectedIndex: number
    filterText: string
    onChangeFilterText: (text: string) => void
    onSelect: (selectedIndex?: number) => void
    items: IMenuOptionWithHighlights[]
    isLoading: boolean

    backgroundColor: string
    foregroundColor: string
}

export class MenuView extends React.PureComponent<IMenuProps, {}> {

    private _inputElement: HTMLInputElement = null

    public componentWillUpdate(newProps: Readonly<IMenuProps>): void {
        if (newProps.visible !== this.props.visible
            && !newProps.visible
            && this._inputElement) {
            focusManager.popFocus(this._inputElement)
        }
    }

    public render(): null | JSX.Element {
        if (!this.props.visible) {
            return null
        }

        // TODO: sync max display items (10) with value in Reducer.popupMenuReducer() (Reducer.ts)
        // const initialItems = take(this.props.items, 10)

        // const initialItems = this.props.items
        // const pinnedItems = initialItems.filter(f => f.pinned)
        // const unpinnedItems = initialItems.filter(f => !f.pinned)
        // const items = initialItems.map((menuItem, index) =>
        //     // FIXME: undefined
        //     <MenuItem {...menuItem as any}
        //         key={index}
        //         filterText={this.props.filterText}
        //         isSelected={index === this.props.selectedIndex}
        //         onClick={() => this.props.onSelect(index)}
        //     />)

        const rowRenderer = (props: { key: string, index: number, style: React.CSSProperties}) => {
            const item = this.props.items[props.index]
            return <MenuItem {...item as any} key={props.key} filterText={this.props.filterText} isSelected={props.index === this.props.selectedIndex}
                onClick={() => this.props.onSelect(props.index)} />
        }

        const menuStyle = {
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
        }

        const footerClassName = "footer " + (this.props.isLoading ? "loading" : "loaded")

        return <div className="menu-background enable-mouse">
            <div className="menu" style={menuStyle}>
                <TextInputView
                    overrideDefaultStyle={true}
                    backgroundColor={null}
                    foregroundColor={this.props.foregroundColor}
                    onChange={(evt) => this._onChange(evt)}
            />
                <div className="items">
                    <div>
                    <List scrollToIndex={this.props.selectedIndex} width={300} height={250} rowCount={this.props.items.length} rowHeight={20} rowRenderer={rowRenderer} />
                    </div>
                </div>
                <div className={footerClassName} style={menuStyle}>
                    <div className="loading-spinner">
                        <Icon name="circle-o-notch" className=" fa-spin" size={IconSize.Large} />
                    </div>
                </div>
            </div>
        </div>
    }

    private _onChange(evt: React.FormEvent<HTMLInputElement>) {
        const target: any = evt.target
        this.props.onChangeFilterText(target.value)
    }
}

const EmptyArray: any[] = []
const noop = () => { } // tslint:disable-line

const mapStateToProps = (state: State.IMenus<Oni.Menu.MenuOption, IMenuOptionWithHighlights>) => {
    if (!state.menu) {
        return {
            visible: false,
            selectedIndex: 0,
            filterText: "",
            items: EmptyArray,
            backgroundColor: "black",
            foregroundColor: "white",
            onSelect: noop,
            isLoading: true,
        }
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
        }
    }
}

const mapDispatchToProps = (dispatch: any) => {
    const dispatchFilterText = (text: string) => {
        dispatch(ActionCreators.filterMenu(text))
    }

    return {
        onChangeFilterText: dispatchFilterText,
    }
}

export const ConnectedMenu = connect(mapStateToProps, mapDispatchToProps)(MenuView)

export const MenuContainer = () => {
    return <Provider store={menuStore}>
            <ConnectedMenu />
        </Provider>
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
    onClick: () => void
}

export class MenuItem extends React.PureComponent<IMenuItemProps, {}> {

    public render(): JSX.Element {
        let className = "item"

        if (this.props.isSelected) {
            className += " selected"
        }

        const icon = this.props.icon && typeof this.props.icon === "string" ? <Icon name={this.props.icon} /> : this.props.icon

        return <div className={className} onClick={() => this.props.onClick()}>
            {icon}
            <HighlightTextByIndex className="label" text={this.props.label} highlightIndices={this.props.labelHighlights} highlightClassName={"highlight"} />
            <HighlightTextByIndex className="detail" text={this.props.detail} highlightIndices={this.props.detailHighlights} highlightClassName={"highlight"} />
            <Visible visible={this.props.pinned}>
                <Icon name="clock-o" />
            </Visible>
        </div>
    }
}
