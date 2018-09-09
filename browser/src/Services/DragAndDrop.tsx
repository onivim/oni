import * as React from "react"
import * as DND from "react-dnd"

type Render<T> = (props: T) => React.ReactElement<T>
type OnDrop = (item: any) => object | void
type IsValidDrop = (item: any) => boolean

// Drop Target ================================================================
export interface IDroppeable {
    isOver?: boolean
    connectDropTarget?: any
    onDrop: OnDrop
    isValidDrop: IsValidDrop
    canDrop?: boolean
    didDrop?: boolean
    accepts: string[] | string
    render: Render<{
        canDrop: boolean
        isOver?: boolean
        didDrop?: boolean
        connectDropTarget?: DND.DropTargetConnector
    }>
}
interface DroppedProps {
    onDrop: OnDrop
    isValidDrop: IsValidDrop
}

const DropTarget = {
    drop(dropped: DroppedProps, monitor: DND.DropTargetMonitor) {
        return dropped.onDrop({ drag: monitor.getItem(), drop: dropped })
    },
    canDrop(props: DroppedProps, monitor: DND.DropTargetMonitor) {
        return props.isValidDrop({ drag: monitor.getItem(), drop: props })
    },
}

const DropCollect = (connect: DND.DropTargetConnector, monitor: DND.DropTargetMonitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    didDrop: monitor.didDrop(),
})

/**
 * A component which can have items of a specific matching type dropped onto it
 */
@DND.DropTarget<IDroppeable>(({ accepts }) => accepts, DropTarget, DropCollect)
export class Droppeable<P extends IDroppeable> extends React.Component<P> {
    public render() {
        const { isOver, connectDropTarget, canDrop, didDrop } = this.props
        return connectDropTarget(<div>{this.props.render({ isOver, canDrop, didDrop })}</div>)
    }
}

// Drag Source ================================================================
export interface IDraggeable {
    target?: string
    isDragging?: boolean
    connectDragSource?: any
    render: Render<{ isDragging?: boolean; connectDragSource?: DND.DragSourceConnector }>
}

const DragSource = {
    beginDrag(props: object) {
        return props
    },
}

const DragCollect = (connect: DND.DragSourceConnector, monitor: DND.DragSourceMonitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

/**
 * A component that can be dragged onto a droppeable one
 *
 * @name props
 * @function
 * @param {String | String[]} props.target The target Type that responds to the drop
 * @param {Object} DragSource Object with a beginDrag which return the dragged props
 * @param {React.Component} A component which is dragged onto another
 * @returns {React.Component<P>} A react class component
 */
@DND.DragSource<IDraggeable>(props => props.target, DragSource, DragCollect)
export class Draggeable<P extends IDraggeable> extends React.Component<P> {
    public render() {
        const { isDragging, connectDragSource } = this.props
        return connectDragSource(<div>{this.props.render({ isDragging })}</div>)
    }
}

interface IDragDrop {
    isOver?: boolean
    didDrop?: boolean
    onDrop: OnDrop
    accepts: string[] | string
    connectDropTarget?: any
    canDrop?: boolean
    isValidDrop: IsValidDrop
    dragTarget: string
    isDragging?: boolean
    connectDragSource?: any
    render: Render<{ didDrop?: boolean; canDrop?: boolean; isOver?: boolean; isDragging?: boolean }>
}

/**
 * A render prop which takes a given component and makes it a drop target as well as draggeable
 */
@DND.DropTarget<IDragDrop>(props => props.accepts, DropTarget, DropCollect)
@DND.DragSource<IDragDrop>(props => props.dragTarget, DragSource, DragCollect)
export class DragAndDrop<P extends IDragDrop> extends React.Component<P> {
    public render() {
        const { connectDragSource, connectDropTarget } = this.props

        return connectDropTarget(connectDragSource(<div>{this.props.render(this.props)}</div>))
    }
}
