import * as React from "react"

export interface VisibleProps {
    visible:  boolean
}

export class Visible extends React.Component<VisibleProps, void> {

    public render(): null | JSX.Element {
        if(this.props.visible) {
            return React.Children.only(this.props.children)
        } else {
            return null
        }
    }
}
