import * as React from "react"

interface Props {
    children: React.ReactNode
    className: string
    passWidth?: (data: IChildDimensions) => void
}

interface State {
    width?: number
}

interface IChildDimensions {
    direction: string
    width: number
    id: string
    priority: number
    hide: boolean
}

interface State {
    containerWidth: number
    children: {
        [id: string]: any;
    }
}

class StatusBarResizer extends React.Component<Props, State> {
    private observer: any
    private elem: Element
    constructor(props: Props) {
        super(props)
        this.state = {
            containerWidth: null,
            children: {},
        }
    }

    public componentDidMount() {
        this.setState({
            containerWidth: this.elem.getBoundingClientRect().width,
        })
        // tslint:disable-next-line
        this.observer = new window["ResizeObserver"](([entry]: any) => {
            this.setState({ containerWidth: entry.contentRect.width }, this.resize)
        })
        this.observer.observe(this.elem)
    }

    public componentWillUnmount() {
        this.observer.disconnect()
    }

    public render() {
        const { containerWidth } = this.state
        const { children, className } = this.props
        this.log("Container Width", containerWidth)
        return (
            <div ref={elem => (this.elem = elem)} className={className}>
                {containerWidth !== undefined &&
                    React.Children.map(children, (child: any) => {
                        const current = this.state.children[child.props.id]
                        return React.cloneElement(child, {
                            ...child.props,
                            passWidth: this.passWidth,
                            hide: !!current && current.hide,
                        })
                    })}
            </div>
        )
    }

    private passWidth = (childDimensions: IChildDimensions) => {
        const { width, id, priority, hide } = childDimensions
        this.setState(
            state => ({
                ...state,
                children: {
                    ...state.children,
                    [id]: { id, width, priority, hide },
                },
            }),
            this.resize,
        )
    }

    private resize = () => {
        const childArray = Object.values(this.state.children)
        const widths = childArray.map(child => child.width).filter(v => !!v)
        if (widths.length) {
            const sum = widths.reduce((p, n) => p + n)
            const lowestPriority = childArray.reduce(
                (prev, next) => (prev.priority > next.priority && !prev.hide ? prev : next),
            )
            if (sum) {
                const tooBig = sum > this.state.containerWidth
                this.log("too big", tooBig)
                this.setState(
                    state => ({
                        ...state,
                        children: {
                            ...state.children,
                            [lowestPriority.id]: {
                                ...state.children[lowestPriority.id],
                                hide: tooBig,
                            },
                        },
                    }),
                    () => {
                        this.log("state", this.state)
                        this.log("priority", lowestPriority)
                    },
                )
            }
            this.log("sum", sum)
        }
    }

    private log(name: string, arg: any) {
        console.log(`${this.props.className} ${name}`, arg); // tslint:disable-line
    }
}

export default StatusBarResizer
