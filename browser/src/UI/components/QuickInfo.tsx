import * as os from "os"

import * as React from "react"
import { connect } from "react-redux"

import { IState } from "./../State"

import { CursorPositioner } from "./CursorPositioner"

import * as Color from "color"
import * as types from "vscode-languageserver-types"

require("./QuickInfo.less") // tslint:disable-line no-var-requires

export interface IQuickInfoProps {
    visible: boolean
    elements: JSX.Element[]

    backgroundColor: string
    foregroundColor: string
}

const getBorderColor = (bgColor: string, fgColor: string): string => {
    const backgroundColor = Color(bgColor)
    const foregroundColor = Color(fgColor)

    const borderColor = backgroundColor.luminosity() > 0.5 ? foregroundColor.lighten(0.6) : foregroundColor.darken(0.6)
    return borderColor.rgb().toString()
}

export class QuickInfo extends React.PureComponent<IQuickInfoProps, void> {

    public render(): null | JSX.Element {
        if (!this.props.elements || !this.props.elements.length) {
            return null
        }

        const borderColorString = getBorderColor(this.props.backgroundColor, this.props.foregroundColor)

        const quickInfoStyle: React.CSSProperties = {
            "opacity": this.props.visible ? 1 : 0,
            backgroundColor: this.props.backgroundColor,
            border: `1px solid ${borderColorString}`,
            color: this.props.foregroundColor,
        }

        return <CursorPositioner beakColor={borderColorString}>
            <div key={"quickinfo-container"} className="quickinfo-container enable-mouse">
                <div key={"quickInfo"} style={quickInfoStyle} className="quickinfo">
                    {this.props.elements}
                </div>
            </div>
        </CursorPositioner>
    }
}

export interface ITextProps {
    text: string
}

export class TextComponent extends React.PureComponent<ITextProps, void> {

}

export class QuickInfoTitle extends TextComponent {
    public render(): JSX.Element {
        return <div className="title">{this.props.text}</div>
    }
}

export class QuickInfoDocumentation extends TextComponent {
    public render(): JSX.Element {

        if (!this.props.text) {
            return null
        }

        const lines = this.props.text.split(os.EOL)
        const divs = lines.map((l) => <div>{l}</div>)

        return <div className="documentation">{divs}</div>
    }
}

export class Text extends TextComponent {
    public render(): JSX.Element {
        return <span>{this.props.text}</span>
    }
}

export class SelectedText extends TextComponent {
    public render(): JSX.Element {
        return <span className="selected">{this.props.text}</span>
    }
}

import { createSelector } from "reselect"
import * as Selectors from "./../Selectors"

import { ErrorInfo } from "./ErrorInfo"

const getQuickInfo = Selectors.getQuickInfo

const EmptyArray: JSX.Element[] = []

const getColors = (state: IState) => ({
    foregroundColor: state.foregroundColor,
    backgroundColor: state.backgroundColor,
})

const getQuickInfoElement = createSelector(
    [getQuickInfo, Selectors.getErrorsForPosition, getColors],
    (quickInfo, errors, colors) => {

        if (!quickInfo && !errors) {
            return EmptyArray
        } else {

            const quickInfoElements = getQuickInfoElements(quickInfo)

            let customErrorStyle = { }
            if (quickInfoElements.length > 0) {
                const borderColor = getBorderColor(colors.backgroundColor, colors.foregroundColor)
                customErrorStyle = {
                    "border-bottom": "1px solid " + borderColor
                }
            }

            const errorElements = getErrorElements(errors, customErrorStyle)
            return errorElements.concat(quickInfoElements)
        }
    })

const getErrorElements = (errors: types.Diagnostic[], style: any): JSX.Element[] => {

    if (!errors || !errors.length) {
        return EmptyArray
    } else {
        return [<ErrorInfo errors={errors} style={style} />]
    }

}

const getQuickInfoElements = (quickInfo: Oni.Plugin.QuickInfo): JSX.Element[] => {

    if (!quickInfo || (!quickInfo.title && !quickInfo.description)) {
        return EmptyArray
    } else {
        return [
            <QuickInfoTitle text={quickInfo.title} />,
            <QuickInfoDocumentation text={quickInfo.description} />,
        ]
    }

}

const mapStateToQuickInfoProps = (state: IState): IQuickInfoProps => {
    const quickInfo = Selectors.getQuickInfo(state)
    if (!quickInfo || state.mode !== "normal") {
        return {
            visible: false,
            elements: EmptyArray,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
        }
    } else {

        const elements = getQuickInfoElement(state)

        if (elements.length === 0) {
            return {
                visible: false,
                elements: EmptyArray,
                foregroundColor: state.foregroundColor,
                backgroundColor: state.backgroundColor,
            }
        } else {
            return {
                visible: true,
                elements,
                foregroundColor: state.foregroundColor,
                backgroundColor: state.backgroundColor,
            }
        }
    }
}

const mapStateToSignatureHelpProps = (state: IState): IQuickInfoProps => {
    if (!state.signatureHelp) {
        return {
            visible: false,
            elements: EmptyArray,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
        }
    } else {
        const currentItem = state.signatureHelp.items[state.signatureHelp.selectedItemIndex]

        const parameters = currentItem.parameters.map((item, idx) => {
            // check state.signatureHelp to avoid "Object is possibly 'null'" error
            // even though we already checked it in the 'if' statement above
            if (state.signatureHelp && idx === state.signatureHelp.argumentIndex) {
                return <SelectedText text={item.text} />
            } else {
                return <Text text={item.text} />
            }
        })

        // insert ", " separator in between each parameter
        for (let i = currentItem.parameters.length - 1; i > 0; i -= 1) {
          parameters.splice(i, 0, <Text text={currentItem.separator + " "} />)
        }

        const titleContents = [<Text text={currentItem.prefix} />]
            .concat(parameters)
            .concat([<Text text={currentItem.suffix} />])

        const elements = [<div className="title">{titleContents}</div>]

        const selectedIndex = Math.min(currentItem.parameters.length, state.signatureHelp.argumentIndex)
        const selectedArgument = currentItem.parameters[selectedIndex]
        if (selectedArgument && selectedArgument.documentation) {
            elements.push(<QuickInfoDocumentation text={selectedArgument.documentation} />)
        }

        return {
            visible: true,
            elements,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
        }
    }
}

export const QuickInfoContainer = connect(mapStateToQuickInfoProps)(QuickInfo)
export const SignatureHelpContainer = connect(mapStateToSignatureHelpProps)(QuickInfo)
