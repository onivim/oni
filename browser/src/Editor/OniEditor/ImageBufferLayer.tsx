/**
 * ImageBufferLayer.tsx
 */

import * as React from "react"

// import styled, { keyframes } from "styled-components"

// import { inputManager, InputManager } from "./../../Services/InputManager"

import * as Oni from "oni-api"

// import { withProps } from "./../../UI/components/common"
// import { VimNavigator } from "./../../UI/components/VimNavigator"

export class ImageBufferLayer implements Oni.EditorLayer {
    public get id(): string {
        return "oni.image"
    }

    public get friendlyName(): string {
        return "Image"
    }

    public render(context: Oni.EditorLayerRenderContext): JSX.Element {
        return <div>Hello World</div>
    }
}
