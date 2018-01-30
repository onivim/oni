/**
 * ActiveWindow.tsx
 *
 * Helper component that is always sized and positioned around the currently
 * active window in Neovim.
 */

import * as React from "react"

export interface IActiveWindowProps {
    pixelX: number
    pixelY: number
    pixelWidth: number
    pixelHeight: number
}

export class NeovimActiveWindow extends React.PureComponent<IActiveWindowProps, {}> {
    public render(): JSX.Element {
        const px = (str: number): string => `${str}px`

        const style: React.CSSProperties = {
            position: "absolute",
            left: px(this.props.pixelX),
            top: px(this.props.pixelY),
            width: px(this.props.pixelWidth),
            height: px(this.props.pixelHeight),
            overflowY: "hidden",
            overflowX: "hidden",
        }

        return <div style={style}>{this.props.children}</div>
    }
}
