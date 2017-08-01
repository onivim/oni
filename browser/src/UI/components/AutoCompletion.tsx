/**
 * AutoCompletion.tsx
 */

import * as _ from "lodash"
import * as React from "react"
import * as types from "vscode-languageserver-types"

import { connect } from "react-redux"

import { Icon } from "./../Icon"
import { IState /*, AutoCompletionInfo */ } from "./../State"
import { HighlightText } from "./HighlightText"

export interface IAutoCompletionProps {
    visible: boolean
    x: number
    y: number
    base: string
    entries: Oni.Plugin.CompletionInfo[]
    selectedIndex: number
}

require("./AutoCompletion.less") // tslint:disable-line no-var-requires

export class AutoCompletion extends React.PureComponent<IAutoCompletionProps, void> {

    public render(): null | JSX.Element {

        if (!this.props.visible) {
            return null
        }

        const containerStyle = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            left: this.props.x.toString() + "px",
        }

        if (this.props.entries.length === 0) {
            return null
        }

        if (this.props.entries.length === 1
            && this.props.entries[0].label === this.props.base) {
            return null
        }

        // TODO: sync max display items (10) with value in Reducer.autoCompletionReducer() (Reducer.ts)
        const firstTenEntries = _.take(this.props.entries, 10)

        const entries = firstTenEntries.map((s, i) => {
            const isSelected = i === this.props.selectedIndex

            return <AutoCompletionItem {...s} isSelected={isSelected} base={this.props.base} />
        })

        const selectedItemDocumentation = getDocumentationFromItems(firstTenEntries, this.props.selectedIndex)

        return (<div style={containerStyle} className="autocompletion enable-mouse">
            <div className="entries">
                {entries}
            </div>
            <AutoCompletionDocumentation documentation={selectedItemDocumentation} />
        </div>)
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
}

export class AutoCompletionItem extends React.Component<IAutoCompletionItemProps, void> {
    public render(): JSX.Element {

        let className = "entry"
        if (this.props.isSelected) {
            className += " selected"
        }

        const highlightColor = this.props.highlightColor || this._getDefaultHighlightColor(this.props.kind as any) // FIXME: undefined

        const iconContainerStyle = {
            backgroundColor: highlightColor,
        }

        return <div className={className}>
            <div className="main">
                <span className="icon" style={iconContainerStyle}>
                    <AutoCompletionIcon kind={this.props.kind as any /* FIXME: undefined */} />
                </span>
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

export class AutoCompletionIcon extends React.Component<IAutoCompletionIconProps, void> {

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

const mapStateToProps = (state: IState) => {
    if (!state.autoCompletion) {
        return {
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY + state.fontPixelHeight,
            base: "",
            entries: [],
            selectedIndex: 0,
        }
    } else {
        const ret: IAutoCompletionProps = {
            visible: true,
            x: state.cursorPixelX,
            y: state.cursorPixelY + state.fontPixelHeight,
            base: state.autoCompletion.base,
            entries: state.autoCompletion.entries,
            selectedIndex: state.autoCompletion.selectedIndex,
        }
        return ret
    }
}

export const AutoCompletionContainer = connect(mapStateToProps)(AutoCompletion)
