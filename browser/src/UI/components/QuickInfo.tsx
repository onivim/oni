import * as os from "os"

import * as React from "react"
import { connect } from "react-redux"

import { IState } from "./../State"

require("./QuickInfo.less") // tslint:disable-line no-var-requires

export interface IQuickInfoProps {
    visible: boolean
    elements: JSX.Element[]

    backgroundColor: string
    foregroundColor: string
}

const getOpenPosition = (state: IState): { backgroundColor: string, x: number, y: number, openFromTop: boolean } => {
    const openFromTopPosition = state.cursorPixelY + (state.fontPixelHeight * 2)
    const openFromBottomPosition = state.cursorPixelY - state.fontPixelHeight

    const openFromTop = state.cursorPixelY < 75

    const xPos = state.cursorPixelX - (state.fontPixelWidth / 2) - 2
    const yPos = openFromTop ? openFromTopPosition : openFromBottomPosition

    return {
        x: xPos,
        y: yPos,
        openFromTop,
        backgroundColor: state.backgroundColor,
    }
}

export interface ICursorPositionerViewProps {
    x: number
    y: number

    openFromTop: boolean

    backgroundColor: string
}

export interface ICursorPositionerViewState {
    measuredRect: ClientRect | null
}

/**
 * Helper component to position an element relative to the current cursor position
 */
export class CursorPositionerView extends React.PureComponent<ICursorPositionerViewProps, ICursorPositionerViewState> {

    constructor(props: ICursorPositionerViewProps) {
        super(props)

        this.state = {
            measuredRect: null
        }
    }

    private _measureElement(element: HTMLElement): void {
        if (element) {
            const rect = element.getBoundingClientRect()

            if (!this.state.measuredRect
                || this.state.measuredRect.width !== rect.width
                || this.state.measuredRect.height !== rect.height) {

                this.setState({
                    measuredRect: rect
                })
            }
        }
    }

    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            left: this.props.x.toString() + "px",
        }

        const openFromBottomStyle: React.CSSProperties = {
            position: "absolute",
            bottom: "0px",
        }

        const openFromTopStyle: React.CSSProperties = {
            position: "absolute",
            top: "0px",
        }

        const innerStyle = this.props.openFromTop ? openFromTopStyle : openFromBottomStyle

        return <div style={containerStyle}>
                <div style={innerStyle}>
                    <div ref={(elem) => this._measureElement(elem) }>
                        // <div>{!!this.state.measuredRect ? `${this.state.measuredRect.width}x${this.state.measuredRect.height}`: ""}</div>
                        {this.props.children}
                    </div>
                 </div>
                 <div style={{position: "absolute", top: "0px", left: "2px"}}>
                     <Arrow direction={this.props.openFromTop ? ArrowDirection.Up : ArrowDirection.Down} size={10} color={this.props.backgroundColor} />
                 </div>
                </div>
    }
}

export enum ArrowDirection {
    Up = 0,
    Down,
}


export interface IArrowProps {
    size: number
    color: string
    direction: ArrowDirection
}

export const Arrow = (props: IArrowProps): JSX.Element => {

    const transparentBorder = `${props.size * 0.8}px solid transparent`
    const solidBorder = `${props.size}px solid ${props.color}`

    const upArrowStyle = {
        width: "0px",
        height: "0px",
        borderLeft: transparentBorder,
        borderRight: transparentBorder,
        borderBottom: solidBorder,
    }

    const downArrowStyle = {
        width: "0px",
        height: "0px",
        borderLeft: transparentBorder,
        borderRight: transparentBorder,
        borderTop: solidBorder
    }

    const style = props.direction === ArrowDirection.Up ? upArrowStyle : downArrowStyle

    return <div style={style}></div>
}

const mapStateToProps2 = (state: IState): ICursorPositionerViewProps => {
    return getOpenPosition(state)
}

export const CursorPositioner = connect(mapStateToProps2)(CursorPositionerView)

export class QuickInfo extends React.PureComponent<IQuickInfoProps, void> {

    public render(): null | JSX.Element {
        if (!this.props.elements || !this.props.elements.length) {
            return null
        }

        const innerCommonStyle: React.CSSProperties = {
            "opacity": this.props.visible ? 1 : 0,
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
        }

        return <CursorPositioner>
            <div key={"quickinfo-container"} className="quickinfo-container enable-mouse">
                <div key={"quickInfo"} style={innerCommonStyle} className="quickinfo">
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

const getQuickInfo = (state: IState) => state.quickInfo

const getCursorCharacter = (state: IState) => state.cursorCharacter

const EmptyArray: JSX.Element[] = []

const getQuickInfoElement = createSelector(
    [getQuickInfo, getCursorCharacter],
    (quickInfo, cursorCharacter) => {

        if (!quickInfo || !cursorCharacter) {
            return EmptyArray
        } else {
            return [
                <QuickInfoTitle text={quickInfo.title} />,
                <QuickInfoDocumentation text={quickInfo.description} />,
            ]
        }
    })

const mapStateToQuickInfoProps = (state: IState): IQuickInfoProps => {
    const elements = getQuickInfoElement(state)

    if (!state.quickInfo || !state.cursorCharacter) {
        return {
            visible: false,
            elements,
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
