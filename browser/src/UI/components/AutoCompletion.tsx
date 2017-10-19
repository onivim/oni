/**
 * AutoCompletion.tsx
 */

import * as take from "lodash/take"
import * as React from "react"
import * as types from "vscode-languageserver-types"

import { connect } from "react-redux"

import * as Colors from "./../Colors"
import { Icon } from "./../Icon"
import { IState /*, AutoCompletionInfo */ } from "./../State"

import { Arrow, ArrowDirection } from "./Arrow"
import { CursorPositioner, OpenDirection } from "./CursorPositioner"
import { HighlightText } from "./HighlightText"

export interface IAutoCompletionProps {
    visible: boolean
    base: string
    entries: Oni.Plugin.CompletionInfo[]
    selectedIndex: number

    fontWidthInPixels: number

    backgroundColor: string
    foregroundColor: string
}

require("./AutoCompletion.less") // tslint:disable-line no-var-requires

export class AutoCompletion extends React.PureComponent<IAutoCompletionProps, void> {

    public render(): null | JSX.Element {

        if (!this.props.visible) {
            return null
        }

        const highlightColor = Colors.getBorderColor(this.props.backgroundColor, this.props.foregroundColor)

        const containerStyle: React.CSSProperties = {
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
            border: "1px solid " + highlightColor,
            marginLeft: (-3 * this.props.fontWidthInPixels) + "px",
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

            return <AutoCompletionItem {...s} isSelected={isSelected} base={this.props.base} highlightColor={highlightColor}/>
        })

        const selectedItemDocumentation = getDocumentationFromItems(firstTenEntries, this.props.selectedIndex)

        return (<CursorPositioner beakColor={highlightColor} openDirection={OpenDirection.Down} hideArrow={true}>
                <div style={containerStyle} className="autocompletion enable-mouse">
                    <div className="entries">
                        {entries}
                    </div>
                    <AutoCompletionDocumentation documentation={selectedItemDocumentation} />
                </div>
               </CursorPositioner>)
    }
}

const getDocumentationFromItems = (items: Oni.Plugin.CompletionInfo[], selectedIndex: number): string => {
    if (!items || !items.length) {
        return null
    }

    if (selectedIndex >= items.length) {
        return null
    }

    return items[selectedIndex].documentation
}

export interface IAutoCompletionItemProps extends Oni.Plugin.CompletionInfo {
    base: string
    isSelected: boolean
    highlightColor?: string
}

export class AutoCompletionItem extends React.PureComponent<IAutoCompletionItemProps, void> {
    public render(): JSX.Element {

        let className = "entry"
        if (this.props.isSelected) {
            className += " selected"
        }

        const highlightColor = this.props.highlightColor || this._getDefaultHighlightColor(this.props.kind as any) // FIXME: undefined

        const iconContainerStyle = {
            backgroundColor: highlightColor,
        }

        const arrowColor = this.props.isSelected ? highlightColor : "transparent"

        return <div className={className}>
            <div className="main">
                <span className="icon" style={iconContainerStyle}>
                    <AutoCompletionIcon kind={this.props.kind as any /* FIXME: undefined */} />
                </span>
                <Arrow direction={ArrowDirection.Right} size={5}  color={arrowColor}/>
                <HighlightText className="label" highlightClassName="highlight" highlightText={this.props.base} text={this.props.label} />
                <span className="detail">{this.props.detail}</span>
            </div>
        </div>
    }

    private _getDefaultHighlightColor(_kind: string): string {
        // TODO: Extend this logic for better defaults per kind
        return "rgb(0, 255, 100)"
    }
}

export interface IAutoCompletionDocumentationProps {
    documentation: string
}

export const AutoCompletionDocumentation = (props: IAutoCompletionDocumentationProps) => {
    const { documentation } = props

    if (!documentation) {
        return null
    }

    return <div className="documentation">{documentation}</div>
}

export interface IAutoCompletionIconProps {
    kind: types.CompletionItemKind
}

export class AutoCompletionIcon extends React.PureComponent<IAutoCompletionIconProps, void> {

    public render(): JSX.Element {

        const icons = {
            [types.CompletionItemKind.Class]: <Icon name="cube" />,
            [types.CompletionItemKind.Color]: <Icon name="paint-brush" />,
            [types.CompletionItemKind.Constructor]: <Icon name="building" />,
            [types.CompletionItemKind.Enum]: <Icon name="sitemap" />,
            [types.CompletionItemKind.Field]: <Icon name="var" />,
            [types.CompletionItemKind.File]: <Icon name="file" />,
            [types.CompletionItemKind.Function]: <Icon name="cog" />,
            [types.CompletionItemKind.Interface]: <Icon name="plug" />,
            [types.CompletionItemKind.Keyword]: <Icon name="key" />,
            [types.CompletionItemKind.Method]: <Icon name="flash" />,
            [types.CompletionItemKind.Module]: <Icon name="cubes" />,
            [types.CompletionItemKind.Property]: <Icon name="wrench" />,
            [types.CompletionItemKind.Reference]: <Icon name="chain" />,
            [types.CompletionItemKind.Snippet]: <Icon name="align-justify" />,
            [types.CompletionItemKind.Text]: <Icon name="align-justify" />,
            [types.CompletionItemKind.Unit]: <Icon name="tag" />,
            [types.CompletionItemKind.Value]: <Icon name="lock" />,
            [types.CompletionItemKind.Variable]: <Icon name="code" />,
        }

        if (!this.props.kind || !icons[this.props.kind]) {
            return <Icon name="question" />
        } else {
            return icons[this.props.kind]
        }
    }
}

const EmptyArray: any[] = []

const mapStateToProps = (state: IState) => {
    if (!state.autoCompletion) {
        return {
            visible: false,
            base: "",
            entries: EmptyArray,
            selectedIndex: 0,
            backgroundColor: "",
            foregroundColor: "",
            fontWidthInPixels: 0,
        }
    } else {
        const ret: IAutoCompletionProps = {
            visible: true,
            base: state.autoCompletion.base,
            entries: state.autoCompletion.entries,
            selectedIndex: state.autoCompletion.selectedIndex,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
            fontWidthInPixels: state.fontPixelWidth,
        }
        return ret
    }
}

export const AutoCompletionContainer = connect(mapStateToProps)(AutoCompletion)
