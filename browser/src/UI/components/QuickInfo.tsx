import * as os from "os"

import * as React from "react"
import { connect } from "react-redux"

import { IState } from "./../State"

require("./QuickInfo.less") // tslint:disable-line no-var-requires

export interface IQuickInfoProps {
    visible: boolean
    x: number
    y: number
    elements: JSX.Element[]
    openFromTop?: boolean
}

export class QuickInfo extends React.PureComponent<IQuickInfoProps, void> {

    public render(): null | JSX.Element {
        if (!this.props.elements || !this.props.elements.length) {
            return null
        }

        const openFromTop = this.props.openFromTop || false

        const containerStyle = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            left: this.props.x.toString() + "px",
        }

        const innerCommonStyle = {
            "position": "absolute",
            "opacity": this.props.visible ? 1 : 0,
            "max-width": (document.body.offsetWidth - this.props.x - 40) + "px",
        }

        const openFromTopStyle = {
            ...innerCommonStyle,
            "top": "0px",
        }

        const openFromBottomStyle = {
            ...innerCommonStyle,
            "bottom": "0px",
        }

        const innerStyle = openFromTop ? openFromTopStyle : openFromBottomStyle

        return <div key={"quickinfo-container"} className="quickinfo-container enable-mouse" style={containerStyle}>
            <div key={"quickInfo"} style={innerStyle} className="quickinfo">
                {this.props.elements}
            </div>
        </div>
    }
}

export interface ITextProps {
    text: string
}

export class TextComponent extends React.Component<ITextProps, void> {

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

const getOpenPosition = (state: IState): { x: number, y: number, openFromTop: boolean } => {
    const openFromTopPosition = state.cursorPixelY + (state.fontPixelHeight * 2)
    const openFromBottomPosition = state.cursorPixelY - state.fontPixelHeight

    const openFromTop = state.cursorPixelY < 75

    const yPos = openFromTop ? openFromTopPosition : openFromBottomPosition

    return {
        x: state.cursorPixelX,
        y: yPos,
        openFromTop,
    }
}

import { createSelector } from "reselect"

const getQuickInfo = (state: IState) => state.quickInfo

const getCursorCharacter = (state: IState) => state.cursorCharacter

const getQuickInfoElement = createSelector(
    [getQuickInfo, getCursorCharacter],
    (quickInfo, cursorCharacter) => {

        if (!quickInfo || !cursorCharacter) {
            return []
        } else {
            return [
                <QuickInfoTitle text={quickInfo.title} />,
                <QuickInfoDocumentation text={quickInfo.description} />,
            ]
        }
    })

const mapStateToQuickInfoProps = (state: IState): IQuickInfoProps => {
    const openPosition = getOpenPosition(state)

    const elements = getQuickInfoElement(state)

    if (!state.quickInfo || !state.cursorCharacter) {
        return {
            ...openPosition,
            visible: false,
            elements,
        }
    } else {
        return {
            ...openPosition,
            visible: true,
            elements,
        }
    }
}

const mapStateToSignatureHelpProps = (state: IState): IQuickInfoProps => {
    const openPosition = getOpenPosition(state)

    if (!state.signatureHelp) {
        return {
            ...openPosition,
            visible: false,
            elements: [],
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

        let titleContents = [<Text text={currentItem.prefix} />]
            .concat(parameters)
            .concat([<Text text={currentItem.suffix} />])

        let elements = [<div className="title">{titleContents}</div>]

        const selectedIndex = Math.min(currentItem.parameters.length, state.signatureHelp.argumentIndex)
        const selectedArgument = currentItem.parameters[selectedIndex]
        if (selectedArgument && selectedArgument.documentation) {
            elements.push(<QuickInfoDocumentation text={selectedArgument.documentation} />)
        }

        return {
            ...openPosition,
            visible: true,
            elements,
        }
    }
}

export const QuickInfoContainer = connect(mapStateToQuickInfoProps)(QuickInfo)
export const SignatureHelpContainer = connect(mapStateToSignatureHelpProps)(QuickInfo)
