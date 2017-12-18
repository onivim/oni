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
        // this.log(`Container Width`, containerWidth)
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
        const sorted = childArray.sort((prev, next) => prev.priority - next.priority)

        // Loop through components sorted by priority check if component can be added without
        // Overshooting container width if so show the component otherwise hide it
        const { acceptedItems } = sorted.reduce(
            (components, item) => {
                let hide
                if (components.widths + item.width < containerWidth) {
                    components.widths += item.width
                    hide = false
                } else {
                    hide = true
                }
                components.acceptedItems[item.id] = {
                    ...this.state.children[item.id],
                    hide,
                }
                return components
            },
            { widths: 0, acceptedItems: {} },
        )

        this.setState(state => ({
            ...state,
            children:  acceptedItems,
        }))
    }

    private log(name: string, arg: any) {
        console.log(`${this.props.direction === "flex-start" ? "left" : "right"} ${name}`, arg); // tslint:disable-line
    }
}

export default StatusBarResizer
