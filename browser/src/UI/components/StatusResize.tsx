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
    childNodes: {
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
            childNodes: {},
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
        console.log(`${className} containerWidth: `, containerWidth); // tslint:disable-line
        return (
            <div ref={elem => (this.elem = elem)} className={className}>
                {containerWidth !== undefined &&
                    React.Children.map(children, (child: any) => {
                        const current = this.state.childNodes[child.props.id]
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
            s => ({
                ...s,
                childNodes: {
                    ...s.childNodes,
                    [id]: { id, width, priority, hide },
                },
            }),
            this.resize,
        )
    }

    private resize = () => {
        const childArray = Object.values(this.state.childNodes)
        const widths = childArray.map(child => child.width).filter(v => !!v)
        if (widths.length) {
            const sum = widths.reduce((p, n) => p + n)
            const lowestPriority = childArray.reduce(
                (prev, next) => (prev.priority > next.priority && !prev.hide ? prev : next),
            )
            if (sum) {
                const tooBig = sum > this.state.containerWidth
                // console.log(`${this.props.className} tooBig: `, tooBig); // tslint:disable-line
                this.setState(
                    s => ({
                        ...s,
                        childNodes: {
                            ...s.childNodes,
                            [lowestPriority.id]: {
                                ...s.childNodes[lowestPriority.id],
                                hide: tooBig,
                            },
                        },
                    }),
                    () => {
                        // console.log(`${this.props.className} state`, this.state)// tslint:disable-line
                        // console.log(`${this.props.className} priority`, lowestPriority)// tslint:disable-line
                    },
                )
            }
            // console.log(`${this.props.className} sum: `, sum)
        }
        // console.log(`${this.props.className} widths: `, widths)
    }
}

export default StatusBarResizer
