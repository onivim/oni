import * as React from "react"

export interface IconProps {
    name: string
}

export class Icon extends React.Component<IconProps, void> {
    public render(): JSX.Element {
        const className = "fa fa-" + this.props.name
        return <i className={className} aria-hidden="true"></i>
    }
}
