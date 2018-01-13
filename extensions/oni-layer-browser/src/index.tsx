/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */

import { shell } from "electron"
import * as React from "react"
import styled from "styled-components"

import * as Oni from "oni-api"

const WebView = require("react-electron-web-view") // tslint:disable-line

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

const BrowserButton = styled.div`
    width: 2.5em;
    height: 2.5em;
    flex: 0 0 auto;
    opacity: 0.9;

    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        opacity: 1.0;
        box-shadow: 0 -8px 20px 0 rgba(0, 0, 0, 0.2);
    }
`

const AddressBar = styled.div`
    width: 100%;
    flex: 1 1 auto;

    height: 2.5em;
    line-height: 2.5em;

    text-align: left;
`

export interface Icons {
    backIcon: any
    forwardIcon: any
    reloadIcon: any
    cancelIcon: any
    debugIcon: any
}

export class BrowserLayer implements Oni.EditorLayer {

    constructor(
        private _url: string,
        private _icons: Icons,
    ) {}

    public get id(): string {
        return "oni.browser"
    }

    public render(): JSX.Element {
        return <BrowserView 
                    url={this._url}
                    icons={this._icons}
                />
    }

    public goBack(): void {
        alert("go back")
    }
}

export interface IBrowserViewProps {
    url: string
    icons: Icons
}

export class BrowserView extends React.PureComponent<IBrowserViewProps, {}> {

    private _webviewElement: any

    public render(): JSX.Element {
        return <Column key={"test2"}>
                <BrowserControlsWrapper>
                    <BrowserButton onClick={() => this._goBack()}>
                        {this.props.icons.backIcon}
                    </BrowserButton>
                    <BrowserButton onClick={() => this._goForward()}>
                        {this.props.icons.forwardIcon}
                    </BrowserButton>
                    <BrowserButton>
                        {this.props.icons.reloadIcon}
                    </BrowserButton>
                    <AddressBar>
                        <span>{this.props.url}</span>
                    </AddressBar>
                    <BrowserButton>
                        {this.props.icons.debugIcon}
                    </BrowserButton>
                </BrowserControlsWrapper>
                <BrowserViewWrapper>
                    <WebView ref={(elem) => this._initializeElement(elem)} src={this.props.url} style={{position: "absolute", top: "0px", left: "0px", right: "0px", bottom: "0px"}} key={"test"}/>
                </BrowserViewWrapper>
            </Column>
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

    private _initializeElement(elem: any) {
        this._webviewElement = elem
    }
}

export const activate = (oni: Oni.Plugin.Api) => {

    let count = 0

    let activeLayers: {[bufferId: string]: BrowserLayer} = {}

    const openUrl = async (url: string) => {
        if (oni.configuration.getValue("experimental.browser.enabled")) {
            count++
            const buffer: Oni.Buffer = await (oni.editors.activeEditor as any).newFile("Browser" + count.toString())

            const oni2: any = oni
            const backIcon = oni2.ui.createIcon({name: "chevron-left", size: oni2.ui.iconSize.Large})
            const forwardIcon = oni2.ui.createIcon({name: "chevron-right", size: oni2.ui.iconSize.Large})
            const reloadIcon = oni2.ui.createIcon({name: "undo", size: oni2.ui.iconSize.Large})
            const cancelIcon = oni2.ui.createIcon({name: "times", size: oni2.ui.iconSize.Large})
            const debugIcon = oni2.ui.createIcon({name: "bug", size: oni2.ui.iconSize.Large})

            const icons: Icons = {
                backIcon,
                forwardIcon,
                reloadIcon,
                cancelIcon,
                debugIcon,
            }

            const layer = new BrowserLayer(url, icons)
            buffer.addLayer(layer)
            activeLayers[buffer.id] = layer
        } else {
            shell.openExternal(url)
        }
    }

    oni.commands.registerCommand({
        command: "browser.openUrl",
        execute: openUrl,
        name: null,
        detail: null,
    })

    const executeCommandForLayer = (callback: (browserLayer: BrowserLayer) => void) => () => {
       const activeBuffer = oni.editors.activeEditor.activeBuffer 

       const browserLayer = activeLayers[activeBuffer.id]
        if (browserLayer) {
            callback(browserLayer)
        }
    }

    const isBrowserLayerActive = () => !!activeLayers[oni.editors.activeEditor.activeBuffer.id]

    // Per-layer commands
    oni.commands.registerCommand({
        command: "browser.goBack",
        execute: executeCommandForLayer((browser) => browser.goBack()),
        name: null,
        detail: null,
        enabled: isBrowserLayerActive,
    })
}
