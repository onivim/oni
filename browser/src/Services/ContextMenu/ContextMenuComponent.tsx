/**
 * ContextMenu.tsx
 */

import * as take from "lodash/take"
import * as React from "react"
import * as types from "vscode-languageserver-types"

import { connect, Provider } from "react-redux"
import { Store } from "redux"

import { IMenus } from "./../Menu/MenuState"

import { Arrow, ArrowDirection } from "./../../UI/components/Arrow"
import { HighlightText } from "./../../UI/components/HighlightText"
import { QuickInfoDocumentation } from "./../../UI/components/QuickInfo"
import { Icon } from "./../../UI/Icon"

import { ContextMenuState } from "./ContextMenu"

export interface IContextMenuItem {
    label: string
    detail?: string
    documentation?: string
    icon?: string | JSX.Element
}

export interface IContextMenuProps {
    visible: boolean
    base: string
    entries: IContextMenuItem[]
    selectedIndex: number

    backgroundColor: string
    foregroundColor: string
    borderColor: string
    highlightColor: string
}

export class ContextMenuView extends React.PureComponent<IContextMenuProps, {}> {
    public render(): null | JSX.Element {
        if (!this.props.visible) {
            return null
        }

        // TODO: sync max display items (10) with value in Reducer.autoCompletionReducer() (Reducer.ts)
        const firstTenEntries = take(this.props.entries, 10)

        const entries = firstTenEntries.map((s, i) => {
            const isSelected = i === this.props.selectedIndex

            return (
                <ContextMenuItem
                    key={`${i}-${s.detail}`}
                    {...s}
                    isSelected={isSelected}
                    base={this.props.base}
                    highlightColor={this.props.highlightColor}
                />
            )
        })

        const selectedItemDocumentation = getDocumentationFromItems(
            firstTenEntries,
            this.props.selectedIndex,
        )
        return (
            <div className="autocompletion enable-mouse">
                <div className="entries">{entries}</div>
                <ContextMenuDocumentation documentation={selectedItemDocumentation} />
            </div>
        )
    }
}

const getDocumentationFromItems = (items: any[], selectedIndex: number): string => {
    if (!items || !items.length) {
        return null
    }

    if (selectedIndex < 0 || selectedIndex >= items.length) {
        return null
    }

    return items[selectedIndex].documentation
}

export interface IContextMenuItemProps extends IContextMenuItem {
    base: string
    isSelected: boolean
    highlightColor?: string
}

export class ContextMenuItem extends React.PureComponent<IContextMenuItemProps, {}> {
    public render(): JSX.Element {
        let className = "entry"
        if (this.props.isSelected) {
            className += " selected"
        }

        const highlightColor = this.props.highlightColor

        const iconContainerStyle = {
            backgroundColor: highlightColor,
        }

        const arrowColor = this.props.isSelected ? highlightColor : "transparent"

        let iconElement: JSX.Element = null

        if (typeof this.props.icon === "string") {
            iconElement = (
                <span className="icon" style={iconContainerStyle}>
                    <Icon name={this.props.icon} />
                </span>
            )
        } else {
            iconElement = this.props.icon
        }

        return (
            <div className={className} key={this.props.label}>
                <div className="main">
                    <Arrow direction={ArrowDirection.Right} size={5} color={arrowColor} />
                    {iconElement}
                    <HighlightText
                        className="label"
                        highlightClassName="highlight"
                        highlightText={this.props.base}
                        text={this.props.label}
                    />
                    <span className="detail">{this.props.detail}</span>
                </div>
            </div>
        )
    }
}

export interface IContextMenuDocumentationProps {
    documentation: string
}

export const ContextMenuDocumentation = (props: IContextMenuDocumentationProps) => {
    const { documentation } = props

    if (!documentation) {
        return null
    }

    return <QuickInfoDocumentation text={documentation} />
}

const EmptyArray: any[] = []

const EmptyProps = {
    visible: false,
    base: "",
    entries: EmptyArray,
    selectedIndex: 0,
    backgroundColor: "",
    foregroundColor: "",
    borderColor: "",
    highlightColor: "",
}

const mapStateToProps = (state: IMenus<types.CompletionItem, types.CompletionItem>) => {
    const contextMenu = state.menu
    if (!contextMenu) {
        return EmptyProps
    } else {
        const ret: IContextMenuProps = {
            visible: true,
            base: contextMenu.filter,
            entries: contextMenu.filteredOptions,
            selectedIndex: contextMenu.selectedIndex,
            foregroundColor: contextMenu.foregroundColor,
            backgroundColor: contextMenu.backgroundColor,
            borderColor: contextMenu.borderColor,
            highlightColor: contextMenu.highlightColor,
        }
        return ret
    }
}

export const ConnectedContextMenu = connect(mapStateToProps)(ContextMenuView)

export const ContextMenuContainer = (props: { store: Store<ContextMenuState> }) => {
    return (
        <Provider store={props.store}>
            <ConnectedContextMenu />
        </Provider>
    )
}
