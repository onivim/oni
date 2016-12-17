import * as React from "react"

export interface CursorProps {
    x: number
    y: number
    width: number
    height: number
    mode: string
    color: string
}

export class Cursor extends React.Component<CursorProps, void> {

    public render(): JSX.Element {

        const width = this.props.mode === "normal" ? this.props.width : this.props.width / 4

        const cursorStyle = {
            position: "absolute",
            left: this.props.x.toString() + "px",
            top: this.props.y.toString() + "px",
            width: width.toString() + "px",
            height: this.props.height.toString() + "px"
            backgroundColor: this.props.color
        }

        return <div style={cursorStyle} />
    }
}
