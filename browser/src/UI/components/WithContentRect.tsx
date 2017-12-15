import * as React from "react"

interface State {
    width: number
}

interface Props {
    innerRef: any
}

export default function withContentRect() {
    return WrappedComponent =>
        class extends React.Component<Props, State> {
            public static defaultProps = {
                innerRef: null,
            }

            public state = {
                width: null,
            }
            private observer: any
            private _node: any

            public componentWillMount() {
                // tslint:disable-next-line
                this.observer = new window["ResizeObserver"](this.measure);
            }

            public render() {
                const { innerRef, onResize, ...props } = this.props
                return (
                    <WrappedComponent
                        {...props}
                        measureRef={this._handleRef}
                        measure={this.measure}
                        width={this.state.width}
                    />
                )
            }

            private measure = ([entry]: any) => {
                if (entry) {
                    this.setState({ width: entry.contentRect.width })
                }
            }

            private _handleRef = node => {
                if (this.observer) {
                    if (node) {
                        this.observer.observe(node)
                    } else {
                        this.observer.disconnect(this._node)
                    }
                }
                this._node = node

                if (typeof this.props.innerRef === "function") {
                    this.props.innerRef(node)
                }
            }
        }
}
