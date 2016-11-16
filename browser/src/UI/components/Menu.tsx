import * as React from "react"

import { connect } from "react-redux"

import * as _ from "lodash"

import * as State from "./../State"
import * as ActionCreators from "./../ActionCreators"

import { Icon } from "./../Icon"

import { HighlightText } from "./HighlightText"
import { Visible } from "./Visible"

/**
 * Popup menu
 */
require("./Menu.less")

export interface MenuProps {
    selectedIndex: number;
    filterText: string
    onChangeFilterText: (text: string) => void
    items: Oni.Menu.MenuOption[]
}

export class Menu extends React.Component<MenuProps, void> {

    private _inputElement: HTMLInputElement = null;

    public render(): JSX.Element {

        const initialItems = _.take(this.props.items, 10);


        const pinnedItems = initialItems.filter(f => f.pinned)
        const unpinnedItems = initialItems.filter(f => !f.pinned)

        const items = initialItems.map((menuItem, index) => <MenuItem {...menuItem} 
                                                                filterText={this.props.filterText}
                                                                isSelected={index === this.props.selectedIndex}
                                                                />)

        return <div className="menu-background">
                    <div className="menu">
                        <input type="text" 
                            ref={(inputElement) => this._inputElement = inputElement}
                            onChange={(evt) => this._onChange(evt)}
                        />
                        <div className="items">
                            {items}
                        </div>
                    </div>
                </div>
    }

    public componentDidMount(): void {
        if(this._inputElement)
            this._inputElement.focus()
    }

    private _onChange(evt: React.FormEvent<HTMLInputElement>) {
        const target: any = evt.target
        this.props.onChangeFilterText(target.value)
    }
}


const mapStateToProps = (state: State.State) => {
    const popupMenu = state.popupMenu
    return {
        selectedIndex: popupMenu.selectedIndex,
        filterText: popupMenu.filter,
        items: popupMenu.filteredOptions
    }
}

const mapDispatchToProps = (dispatch) => {

    const dispatchFilterText = (text: string) => {
        dispatch(ActionCreators.filterMenu(text))
    }

    return {
        onChangeFilterText: dispatchFilterText
    }
}

export const MenuContainer = connect(mapStateToProps, mapDispatchToProps)(Menu)

export interface MenuItemProps {
    isSelected: boolean
    filterText: string
    label: string
    detail: string
    pinned: boolean
}

export class MenuItem extends React.Component<MenuItemProps, void> {

    public render(): JSX.Element {
        let className = "item";

        if(this.props.isSelected) {
            className += " selected"
        }

        return <div className={className}>
            <HighlightText className="label" text={this.props.label} highlightText={this.props.filterText} highlightClassName={"highlight"} />
            <span className="detail">{this.props.detail}</span>
            <Visible visible={this.props.pinned}>
                <Icon name="clock-o" />
            </Visible>
        </div>
    }
}
