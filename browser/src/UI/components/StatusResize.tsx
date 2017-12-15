import * as React from "react"

interface Props {
    children: React.ReactNode
    className: string
}

interface State {
    width?: number
}

class StatusBarResizer extends React.Component<Props, State> {
    private observer: any
    private elem: any

    constructor(props: Props) {
        super(props)

        this.state = {
            width: null,
        }
    }

    public componentDidMount() {
        this.setState({
            width: this.elem.getBoundingClientRect().width,
        })
        // tslint:disable-next-line
        this.observer = new window["ResizeObserver"](([entry]: any) => {
            this.setState({ width: entry.contentRect.width })
        })
        this.observer.observe(this.elem)
    }

    public componentWillUnmount() {
        this.observer.disconnect()
    }

    public render() {
        const { width } = this.state
        const { children, className } = this.props
        console.log("width: ", width)
        return (
            <div ref={elem => (this.elem = elem)} className={className}>
                {width !== undefined &&
                    React.Children.map(children, (child: any) => {
                        return React.cloneElement(child, { ...child.props, width })
                    })}
            </div>
        )
    }
}

export default StatusBarResizer
