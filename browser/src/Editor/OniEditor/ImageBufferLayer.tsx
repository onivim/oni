/**
 * ImageBufferLayer.tsx
 */

import * as React from "react"

import styled from "styled-components"

// import { inputManager, InputManager } from "./../../Services/InputManager"

import * as Oni from "oni-api"

import { withProps } from "./../../UI/components/common"
// import { VimNavigator } from "./../../UI/components/VimNavigator"

export class ImageBufferLayer implements Oni.BufferLayer {
    constructor(private _buffer: Oni.Buffer) {}
    public get id(): string {
        return "oni.image"
    }

    public get friendlyName(): string {
        return "Image"
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return <ImageLayerView imagePath={this._buffer.filePath} key={this._buffer.filePath} />
    }
}

export interface IImageLayerViewProps {
    imagePath: string
}

export interface IImageLayerViewState {
    width: number
    height: number
}

const ImageContainer = withProps<{}>(styled.div)`
    background-color: ${props => props.theme["editor.background"]};
    color: ${props => props.theme["editor.foreground"]};
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    opacity: 0.95;

    & img {
        max-width: 90%;
        max-height: 90%;

        padding-bottom: 2em;
    }
`

export class ImageLayerView extends React.PureComponent<
    IImageLayerViewProps,
    IImageLayerViewState
> {
    constructor(props: IImageLayerViewProps) {
        super(props)

        this.state = {
            width: -1,
            height: -1,
        }
    }
    public componentDidMount(): void {
        const image = new Image()
        image.onload = () => {
            this.setState({
                width: image.width,
                height: image.height,
            })
        }
        image.src = this.props.imagePath
    }

    public render(): JSX.Element {
        const dimensions = this.state ? `${this.state.width}x${this.state.height}` : ""

        return (
            <ImageContainer>
                <img src={this.props.imagePath} />
                <div>{this.props.imagePath}</div>
                <div>{dimensions}</div>
            </ImageContainer>
        )
    }
}
