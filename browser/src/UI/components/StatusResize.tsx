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

type PassWidth = (data: IChildDimensions) => void

interface Props {
    children?: React.ReactNode
    className?: string
    passWidth?: PassWidth
    direction: string
}

interface State {
    containerWidth: number
    children: {
        [id: string]: {
            id: string
            width: number
            hide?: boolean
            priority: number
        }
    }
}

interface Section {
    direction: string
    count: boolean
}

const StatusbarSection = withProps<Section>(styled.div)`
    flex: 1 1 auto;
    display: ${({ count }) => (count ? `none` : `flex`)};
    flex-direction: row;
    height: 100%;
    max-width: 48%;
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
        this.resize()
    }

    public componentWillUnmount() {
        this.observer.disconnect()
    }

    public render() {
        const { containerWidth } = this.state
        const { children, direction } = this.props
        const count = React.Children.count(children)
        return (
            <StatusbarSection
                direction={direction}
                count={count < 1}
                innerRef={(elem: Element) => (this.elem = elem)}
            >
                {containerWidth !== undefined &&
                    React.Children.map(children, (child: React.ReactElement<any>) => {
                        const current = this.state.children[child.props.id]
                        return React.cloneElement(child, {
                            ...child.props,
                            passWidth: this.passWidth,
                            hide: !!current && current.hide,
                            containerWidth,
                        })
                    })}
            </StatusbarSection>
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
        const { statusItems } = sorted.reduce(
            (components, item) => {
                let hide
                // add 20 to the trunctation width so components are not too snug
                if (components.widths + item.width + 20 < containerWidth) {
                    components.widths += item.width
                    hide = false
                } else {
                    hide = true
                }
                components.statusItems[item.id] = {
                    ...this.state.children[item.id],
                    hide,
                }
                return components
            },
            { widths: 0, statusItems: {} },
        )
        this.setState({ children: statusItems })
    }
}

export default StatusBarResizer
