import * as React from "react"
import { connect } from "react-redux"

import * as _ from "lodash"

import { State, AutoCompletionInfo } from "./State"

import { Icon } from "./Icon"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer } from "./components/QuickInfo"
import { HighlightText } from "./components/HighlightText"

class RootComponent extends React.Component<State, void> {
    public render() {

        const children = []

        if(this.props.autoCompletion)
            children.push(<AutoCompletionContainer />)

        if(this.props.quickInfo) 
            children.push(<QuickInfoContainer />)

        if(this.props.popupMenu)
            children.push(<MenuContainer />)

        return <div className="ui-overlay">
                    {children}
                </div>
    }
}


export const RootComponentContainer = connect((state) => {return state})(RootComponent)

export interface AutoCompletionProps {
    x: number
    y: number
    base: string
    entries: Oni.Plugin.CompletionInfo[]
    selectedIndex: number
}

require("./AutoCompletion.less")

export class AutoCompletion extends React.Component<AutoCompletionProps, void> {

    public render(): JSX.Element {

        const containerStyle = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            left: this.props.x.toString() + "px"
        }

        if(this.props.entries.length === 0)
            return null

        if(this.props.entries.length === 1
            && this.props.entries[0].label === this.props.base)
            return null

        const firstTenEntries = _.take(this.props.entries, 10)

        const entries = firstTenEntries.map((s, i) => {

            const isSelected = i === this.props.selectedIndex

            return <AutoCompletionItem {...s} isSelected={isSelected} base={this.props.base}/>
        })

        return (<div style={containerStyle} className="autocompletion">
                {entries}
            </div>)
    }
}

export interface AutoCompletionItemProps extends Oni.Plugin.CompletionInfo {
    base: string
    isSelected: boolean
}

export class AutoCompletionItem extends React.Component<AutoCompletionItemProps, void> {
    public render(): JSX.Element {

        let className = "entry"
        if(this.props.isSelected) {
            className += " selected"
        }

        const detailToShow = this.props.isSelected ? this.props.detail : ""
        const documentation = this.props.isSelected ? this.props.documentation : ""

        return <div className={className}>
                <div className="main">
                    <AutoCompletionIcon kind={this.props.kind} />
                    <HighlightText className="label" highlightClassName="highlight" highlightText={this.props.base} text={this.props.label} />
                    <span className="detail">{detailToShow}</span>
                </div>
                <div className="documentation">{documentation}</div>
               </div>
    }
}

export interface AutoCompletionIconProps {
    kind: string;
}

export class AutoCompletionIcon extends React.Component<AutoCompletionIconProps, void> {

    public render(): JSX.Element {

        switch(this.props.kind) {
            case "let":
                return <Icon name="wrench" />
            case "interface":
                return <Icon name="plug" />
            case "alias":
                return <Icon name="id-badge" />
            case "const":
                return <Icon name="lock" />
            case "class":
                return <Icon name="cube" />
            case "type":
                return <Icon name="sitemap" />
            case "directory":
                return <Icon name="folder" />
            case "var":
            case "property":
            case "parameter":
                // Closed cube?
                return <Icon name="code" />
            case "module":
            case "external module name":
                return <Icon name="cubes" />
            case "method":
            case "function":
                return <Icon name="cog" />
            case "keyword":
                return <Icon name="key" />
            default:
                return !this.props.kind ? null : <span>`?${this.props.kind}?`</span>
        }
    }
}

const mapStateToProps = (state: State) => {
    const ret: AutoCompletionProps = {
        x: state.cursorPixelX,
        y: state.cursorPixelY + state.fontPixelHeight,
        base: state.autoCompletion.base,
        entries: state.autoCompletion.entries,
        selectedIndex: state.autoCompletion.selectedIndex
    }
    return ret
}

const AutoCompletionContainer = connect(mapStateToProps)(AutoCompletion)
