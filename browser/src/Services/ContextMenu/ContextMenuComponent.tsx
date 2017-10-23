/**
 * ContextMenu.tsx
 */

import * as take from "lodash/take"
import * as React from "react"
// import * as types from "vscode-languageserver-types"

import { connect, Provider } from "react-redux"

import { IMenus } from "./../Menu/MenuState"

import * as Colors from "./../../UI/Colors"
import { Arrow, ArrowDirection } from "./../../UI/components/Arrow"
import { HighlightText } from "./../../UI/components/HighlightText"
import { Icon } from "./../../UI/Icon"

import { contextMenuStore } from "./ContextMenu"

export interface IContextMenuProps {
    visible: boolean
    base: string
    entries: any[]
    selectedIndex: number

    backgroundColor: string
    foregroundColor: string
}

require("./ContextMenu.less") // tslint:disable-line no-var-requires

export class ContextMenuView extends React.PureComponent<IContextMenuProps, void> {

    public render(): null | JSX.Element {

        if (!this.props.visible) {
            return null
        }

        const highlightColor = Colors.getBorderColor(this.props.backgroundColor, this.props.foregroundColor)

        const containerStyle: React.CSSProperties = {
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
            border: "1px solid " + highlightColor,
        }

        if (this.props.entries.length === 0) {
            return null
        }

        if (this.props.entries.length === 1
            && this.props.entries[0].label === this.props.base) {
            return null
        }

        // TODO: sync max display items (10) with value in Reducer.autoCompletionReducer() (Reducer.ts)
        const firstTenEntries = take(this.props.entries, 10)

        const entries = firstTenEntries.map((s, i) => {
            const isSelected = i === this.props.selectedIndex

            return <ContextMenuItem {...s} isSelected={isSelected} base={this.props.base} highlightColor={highlightColor}/>
        })

        const selectedItemDocumentation = getDocumentationFromItems(firstTenEntries, this.props.selectedIndex)
        return <div style={containerStyle} className="autocompletion enable-mouse">
                    <div className="entries">
                        {entries}
                    </div>
                    <ContextMenuDocumentation documentation={selectedItemDocumentation} />
                </div>

        // return (<CursorPositioner beakColor={highlightColor} openDirection={OpenDirection.Down} hideArrow={true}>
        //         <div style={containerStyle} className="autocompletion enable-mouse">
        //             <div className="entries">
        //                 {entries}
        //             </div>
        //             <ContextMenuDocumentation documentation={selectedItemDocumentation} />
        //         </div>
        //        </CursorPositioner>)
    }
}

const getDocumentationFromItems = (items: any[], selectedIndex: number): string => {
    if (!items || !items.length) {
        return null
    }

    if (selectedIndex >= items.length) {
        return null
    }

    return items[selectedIndex].documentation
}

export interface IContextMenuItemProps extends Oni.Menu.MenuOption {
    base: string
    isSelected: boolean
    highlightColor?: string
}

export class ContextMenuItem extends React.PureComponent<IContextMenuItemProps, void> {
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

        return <div className={className}>
            <div className="main">
                <span className="icon" style={iconContainerStyle}>
                    <Icon name={this.props.icon} />
                </span>
                <Arrow direction={ArrowDirection.Right} size={5}  color={arrowColor}/>
                <HighlightText className="label" highlightClassName="highlight" highlightText={this.props.base} text={this.props.label} />
                <span className="detail">{this.props.detail}</span>
            </div>
        </div>
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

    return <div className="documentation">{documentation}</div>
}

// export interface IContextMenuIconProps {
//     kind: types.CompletionItemKind
// }

// const completionItemKindToIconName = (completionKind: types.CompletionItemKind) => {
//     switch (completionKind) {
//             case types.CompletionItemKind.Class:
//                return "cube"
//             case types.CompletionItemKind.Color:
//                return "paint-brush"
//             case types.CompletionItemKind.Constructor:
//                return "building"
//             case types.CompletionItemKind.Enum:
//                return "sitemap"
//             case types.CompletionItemKind.Field:
//                return "var"
//             case types.CompletionItemKind.File:
//                return "file"
//             case types.CompletionItemKind.Function:
//                return "cog"
//             case types.CompletionItemKind.Interface:
//                return "plug"
//             case types.CompletionItemKind.Keyword:
//                return "key"
//             case types.CompletionItemKind.Method:
//                return "flash"
//             case types.CompletionItemKind.Module:
//                return "cubes"
//             case types.CompletionItemKind.Property:
//                return "wrench"
//             case types.CompletionItemKind.Reference:
//                return "chain"
//             case types.CompletionItemKind.Snippet:
//                return "align-justify"
//             case types.CompletionItemKind.Text:
//                return "align-justify"
//             case types.CompletionItemKind.Unit:
//                return "tag"
//             case types.CompletionItemKind.Value:
//                return "lock"
//             case types.CompletionItemKind.Variable:
//                return "code"
//             default:
//                 return "question"
//     }
// }

const EmptyArray: any[] = []

const mapStateToProps = (state: IMenus) => {
    const contextMenu = state.menu
    if (!contextMenu) {
        return {
            visible: false,
            base: "",
            entries: EmptyArray,
            selectedIndex: 0,
            backgroundColor: "",
            foregroundColor: "",
        }
    } else {
        const ret: IContextMenuProps = {
            visible: true,
            base: contextMenu.filter,
            entries: contextMenu.filteredOptions,
            selectedIndex: contextMenu.selectedIndex,
            foregroundColor: contextMenu.foregroundColor,
            backgroundColor: contextMenu.backgroundColor,
        }
        return ret
    }
}



const ContextMenuVisibleView = (props: any) => {
    if (props.isVisible) {
        return props.children
    } else {
        return null
    }
}

const mapStateToProps2 = (state: IMenus, originalProps: any) => {
    return {
        ...originalProps,
        isVisible: !!state.menu,
    }
}

const ConnectedContextMenuVisible = connect(mapStateToProps2)(ContextMenuVisibleView)
export const ContextMenuVisibleContainer = (props: any) => {
    return <Provider store={contextMenuStore}>
             <ConnectedContextMenuVisible>
                {props.children}
             </ConnectedContextMenuVisible>
           </Provider>
}

export const ConnectedContextMenu = connect(mapStateToProps)(ContextMenuView)

export const ContextMenuContainer = () => {
    return <Provider store={contextMenuStore}>
             <ConnectedContextMenu />
           </Provider>
}
