/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */

import * as path from "path"

import * as React from "react"
import styled from "styled-components"

import * as Oni from "oni-api"
import { IDisposable, IEvent } from "oni-types"

import { Configuration } from "./../../Services/Configuration"
import { getInstance as getAchievementsInstance } from "./../../Services/Learning/Achievements"
import { getInstance as getSneakInstance, ISneakInfo } from "./../../Services/Sneak"
import { focusManager } from "./../FocusManager"

import { AddressBarView } from "./AddressBarView"
import { BrowserButtonView } from "./BrowserButtonView"

const Column = styled.div`
    pointer-events: auto;

    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;
`

const BrowserControlsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex: 0 0 auto;
    user-select: none;

    height: 3em;
    width: 100%;
    background-color: ${props => props.theme["editor.background"]};
    color: ${props => props.theme["editor.foreground"]};
`

const BrowserViewWrapper = styled.div`
    flex: 1 1 auto;

    width: 100%;
    height: 100%;
    position: relative;

    webview {
        height: 100%;
        width: 100%;
    }
`

export interface IBrowserViewProps {
    initialUrl: string

    configuration: Configuration

    debug: IEvent<void>
    goBack: IEvent<void>
    goForward: IEvent<void>
    reload: IEvent<void>
}

export interface IBrowserViewState {
    url: string
}

export interface SneakInfoFromBrowser {
    id: string
    rectangle: Oni.Shapes.Rectangle
}

export class BrowserView extends React.PureComponent<IBrowserViewProps, IBrowserViewState> {
    private _webviewElement: any
    private _disposables: IDisposable[] = []

    constructor(props: IBrowserViewProps) {
        super(props)

        this.state = {
            url: props.initialUrl,
        }
    }

    public componentDidMount(): void {
        const d1 = this.props.goBack.subscribe(() => this._goBack())
        const d2 = this.props.goForward.subscribe(() => this._goForward())
        const d3 = this.props.reload.subscribe(() => this._reload())
        const d4 = this.props.debug.subscribe(() => this._openDebugger())

        const d5 = getSneakInstance().addSneakProvider(async (): Promise<ISneakInfo[]> => {
            if (this._webviewElement) {
                const promise = new Promise<SneakInfoFromBrowser[]>(resolve => {
                    this._webviewElement.executeJavaScript(
                        "window['__oni_sneak_collector__']()",
                        (result: any) => {
                            resolve(result)
                        },
                    )
                })

                const webviewDimensions: ClientRect = this._webviewElement.getBoundingClientRect()

                const sneaks: SneakInfoFromBrowser[] = await promise

                return sneaks.map(s => {
                    const callbackFunction = (id: string) => () => this._triggerSneak(id)
                    const zoomFactor = this._getZoomFactor()
                    return {
                        rectangle: Oni.Shapes.Rectangle.create(
                            webviewDimensions.left + s.rectangle.x * zoomFactor,
                            webviewDimensions.top + s.rectangle.y * zoomFactor,
                            s.rectangle.width * zoomFactor,
                            s.rectangle.height * zoomFactor,
                        ),
                        callback: callbackFunction(s.id),
                    }
                })
            }

            return []
        })

        const d6 = this.props.configuration.onConfigurationChanged.subscribe(val => {
            const newZoomFactor = val["browser.zoomFactor"]

            if (this._webviewElement && newZoomFactor) {
                this._webviewElement.setZoomFactor(newZoomFactor)
            }
        })

        this._disposables = this._disposables.concat([d1, d2, d3, d4, d5, d6])
    }

    public _triggerSneak(id: string): void {
        if (this._webviewElement) {
            this._webviewElement.focus()
            this._webviewElement.executeJavaScript(`window["__oni_sneak_execute__"]("${id}")`, true)

            getAchievementsInstance().notifyGoal("oni.goal.sneakIntoBrowser")
        }
    }

    public componentWillUnmount(): void {
        this._webviewElement = null
        this._disposables.forEach(d => d.dispose())
        this._disposables = []
    }

    public render(): JSX.Element {
        return (
            <Column key={"test2"}>
                <BrowserControlsWrapper>
                    <BrowserButtonView icon={"chevron-left"} onClick={() => this._goBack()} />
                    <BrowserButtonView icon={"chevron-right"} onClick={() => this._goForward()} />
                    <BrowserButtonView icon={"undo"} onClick={() => this._reload()} />
                    <AddressBarView
                        url={this.state.url}
                        onAddressChanged={url => this._navigate(url)}
                    />
                    <BrowserButtonView icon={"bug"} onClick={() => this._openDebugger()} />
                </BrowserControlsWrapper>
                <BrowserViewWrapper>
                    <div
                        ref={elem => this._initializeElement(elem)}
                        style={{
                            position: "absolute",
                            top: "0px",
                            left: "0px",
                            right: "0px",
                            bottom: "0px",
                        }}
                        key={"test"}
                    />
                </BrowserViewWrapper>
            </Column>
        )
    }

    public prefixUrl = (url: string) => {
        // Regex Explainer - match at the beginning of the string ^
        // brackets to match the selection not partial match like ://
        // match http or https, then match ://
        const hasValidProtocol = /^(https?:)\/\//i
        if (url && !hasValidProtocol.test(url)) {
            return `https://${url}`
        }
        return url
    }

    private _navigate(url: string): void {
        if (this._webviewElement) {
            this._webviewElement.src = this.prefixUrl(url)

            this.setState({
                url,
            })
        }
    }

    private _goBack(): void {
        if (this._webviewElement) {
            this._webviewElement.goBack()
        }
    }

    private _goForward(): void {
        if (this._webviewElement) {
            this._webviewElement.goForward()
        }
    }

    private _openDebugger(): void {
        if (this._webviewElement) {
            this._webviewElement.openDevTools()
        }
    }

    private _reload(): void {
        if (this._webviewElement) {
            this._webviewElement.reload()
        }
    }

    private _getZoomFactor(): number {
        return this.props.configuration.getValue("browser.zoomFactor", 1.0)
    }

    private _initializeElement(elem: HTMLElement) {
        if (elem && !this._webviewElement) {
            const webviewElement = document.createElement("webview")
            webviewElement.preload = path.join(__dirname, "lib", "webview_preload", "index.js")
            elem.appendChild(webviewElement)
            this._webviewElement = webviewElement
            this._webviewElement.src = this.props.initialUrl

            this._webviewElement.addEventListener("dom-ready", () => {
                this._webviewElement.setZoomFactor(this._getZoomFactor())
            })

            this._webviewElement.addEventListener("did-navigate", (evt: any) => {
                this.setState({
                    url: evt.url,
                })
            })

            this._webviewElement.addEventListener("focus", () => {
                focusManager.pushFocus(this._webviewElement)
            })

            this._webviewElement.addEventListener("blur", () => {
                focusManager.popFocus(this._webviewElement)
            })
        }
    }
}
