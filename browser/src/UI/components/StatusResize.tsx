import * as React from "react"
import styled from "styled-components"

import { withProps } from "./common"

interface IChildDimensions {
    direction: string
    width: number
    id: string
    priority: number
    hide: boolean
}

interface Props {
    children?: React.ReactNode
    className?: string
    passWidth?: (data: IChildDimensions) => void
    direction: string
}

interface State {
    containerWidth: number
    children: {
        [id: string]: any;
    }
}

const StatusBarContainer = withProps<{ direction: string; count: boolean }>(styled.div)`
    ${({ count }) => count && `display: none;`};
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    height: 100%;
    max-width: 50%;
    justify-content: ${props => props.direction};
`

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
        const { children, direction } = this.props
        this.log(
            `Container Width ${direction === "flex-start" ? "left" : "right"}`,
            containerWidth,
        )
        const count = React.Children.count(children)
        return (
            <StatusBarContainer
                direction={direction}
                count={count < 1}
                innerRef={(elem: Element) => (this.elem = elem)}
            >
                {containerWidth !== undefined &&
                    React.Children.map(children, (child: any) => {
                        const current = this.state.children[child.props.id]
                        return React.cloneElement(child, {
                            ...child.props,
                            passWidth: this.passWidth,
                            hide: !!current && current.hide,
                        })
                    })}
            </StatusBarContainer>
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
        const { children, containerWidth } = this.state
        const childArray = Object.values(children)
        const widths = childArray.map(child => child.width).filter(v => !!v)

        if (widths.length && childArray.length) {
            const sum = widths.reduce((p, n) => p + n)
            const shown = childArray.filter(child => !child.hide)

            this.log("remaining children", shown)

            const lowestPriority = shown.reduce((prev, next) => {
                return prev.priority < next.priority ? prev : next
            }, {})

            if (sum) {
                const tooBig = sum > containerWidth

                if (tooBig && lowestPriority) {
                    this.log("lowest priority", lowestPriority)
                    this.setState(state => ({
                        ...state,
                        children: {
                            ...state.children,
                            [lowestPriority.id]: {
                                ...state.children[lowestPriority.id],
                                hide: true,
                            },
                        },
                    }))
                } else {
                    this.reset()
                }
                this.log("sum", sum)
            }
        }
    }

    private reset() {
        const { children } = this.state
        const reset = Object.values(children).reduce((acc, child) => {
            acc[child.id] = {
                ...child,
                hide: false,
            }
            return acc
        }, {})

        this.setState(state => ({
            ...state,
            children: reset,
        }))
    }

    private log(name: string, arg: any) {
        console.log(`${name}`, arg); // tslint:disable-line
    }
}

export default StatusBarResizer
