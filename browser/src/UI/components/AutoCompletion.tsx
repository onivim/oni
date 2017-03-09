/**
 * AutoCompletion.tsx
 */

import * as _ from "lodash"
import * as React from "react"

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

export class AutoCompletion extends React.Component<IAutoCompletionProps, void> {

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

        return (<div style={containerStyle} className="autocompletion">
            {entries}
        </div>)
    }
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

        const detailToShow = this.props.isSelected ? this.props.detail : ""
        const documentation = this.props.isSelected ? this.props.documentation : ""

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
                <span className="detail">{detailToShow}</span>
            </div>
            <div className="documentation">{documentation}</div>
        </div>
    }

    private _getDefaultHighlightColor(_kind: string): string {
        // TODO: Extend this logic for better defaults per kind
        return "rgb(32, 232, 38)"
    }
}

export interface IAutoCompletionIconProps {
    kind: string
}

export class AutoCompletionIcon extends React.Component<IAutoCompletionIconProps, void> {

    public render(): JSX.Element {

        const iconName = {
            "let": <Icon name="wrench" />,
            "interface": <Icon name="plug" />,
            "alias": <Icon name="id-badge" />,
            "const": <Icon name="lock" />,
            "constructor": <Icon name="building" />,
            "class": <Icon name="cube" />,
            "type": <Icon name="sitemap" />,
            "directory": <Icon name="folder" />,
            "file": <Icon name="file" />,
            "script": <Icon name="file" />,
            "var": <Icon name="code" />,
            "property": <Icon name="code" />,
            "parameter": <Icon name="code" />,
            "module": <Icon name="cubes" />,
            "external module name": <Icon name="cubes" />,
            "method": <Icon name="cog" />,
            "functioin": <Icon name="cog" />,
            "keyword": <Icon name="key" />,
            "text": <Icon name="align-justify" />,
            "warning": <Icon name="exclamation-triangle" />,
            "$warning": <Icon name="exclamation-triangle" />,
            "default": !!this.props.kind ? <Icon name="question-circle" /> : <span>`?${this.props.kind}?`</span>,
        }

        const kind = this.props.kind || "default"
        return iconName[kind] ? iconName[kind] : iconName["default"]
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
