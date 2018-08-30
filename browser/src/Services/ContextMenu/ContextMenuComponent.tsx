/**
 * ContextMenu.tsx
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import { connect, Provider } from "react-redux"
import { Store } from "redux"

import * as Oni from "oni-api"

import { IMenus } from "./../Menu/MenuState"

import { styled } from "../../UI/components/common"
import { Arrow, ArrowDirection } from "./../../UI/components/Arrow"
import { HighlightText } from "./../../UI/components/HighlightText"
import { QuickInfoDocumentation } from "./../../UI/components/QuickInfo"
import { Icon } from "./../../UI/Icon"

import { ContextMenuState } from "./ContextMenu"

export interface IContextMenuItem {
    label: string
    detail?: string
    documentation?: string
    icon?: string
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

        let entriesToRender: IContextMenuItem[] = []
        let adjustedIndex = this.props.selectedIndex

        // TODO: sync max display items (10) with value in Reducer.autoCompletionReducer() (Reducer.ts)
        if (adjustedIndex < 10) {
            entriesToRender = this.props.entries.slice(0, 10)
        } else {
            entriesToRender = this.props.entries.slice(adjustedIndex - 9, adjustedIndex + 1)
            adjustedIndex = entriesToRender.length - 1
        }

        const entries = entriesToRender.map((s, i) => {
            const isSelected = i === adjustedIndex

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

        const selectedItemDocumentation = getDocumentationFromItems(entriesToRender, adjustedIndex)
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

export interface IContextMenuItemProps extends Oni.Menu.MenuOption {
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

        return (
            <div className={className} key={this.props.label}>
                <div className="main">
                    <span className="icon" style={iconContainerStyle}>
                        <Icon name={this.props.icon} />
                    </span>
                    <Arrow direction={ArrowDirection.Right} size={5} color={arrowColor} />
                    <HighlightText
                        className="label"
                        highlightComponent={Highlight}
                        highlightText={this.props.base}
                        text={this.props.label}
                    />
                    <span className="detail">{this.props.detail}</span>
                </div>
            </div>
        )
    }
}

const Highlight = styled.span`
    text-decoration: underline;
`

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
