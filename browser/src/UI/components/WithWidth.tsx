import * as React from "react"

interface State {
    width: number
}

interface Props {
    innerRef?: any
    type?: any
    passWidth?: any
}

export default function withWidth(WrappedComponent: any) {
    return class extends React.Component<Props, State> {
        public static displayName = `WithWidth(${WrappedComponent.displayName || WrappedComponent.name})`
        private observer: any
        private _node: Element
        constructor(props: Props) {
            super(props)

            this.state = {
                width: null,
            }
        }

        public componentWillMount() {
            // tslint:disable-next-line
            this.observer = new window["ResizeObserver"](this.measure)
        }

        public render() {
            const { innerRef, ...props } = this.props
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

        private _handleRef = (node: Element) => {
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
