import * as React from "react"

export interface IVisibleProps {
    visible: boolean
}

export class Visible extends React.Component<IVisibleProps, void> {

    public render(): null | JSX.Element {
        if (this.props.visible) {
            return React.Children.only(this.props.children)
        } else {
            return null
        }
    }
}
