import * as React from "react"
import * as DND from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"

type Render<T> = (props: T) => React.ReactElement<T>

// Drop Target ================================================================
export interface IDroppeable {
    isOver?: boolean
    connectDropTarget?: any
    onDrop: (item: any) => object
    canDrop: () => boolean
    accepts: string[] | string
    render: Render<{
        canDrop: () => boolean
        isOver?: boolean
        connectDropTarget?: DND.DropTargetConnector
    }>
}
interface DroppedProps {
    onDrop: (item: any) => object
}

const DropTarget = {
    drop(dropped: DroppedProps, monitor: DND.DropTargetMonitor) {
        const dragged = monitor.getItem()
        return dropped.onDrop({ drag: dragged, drop: dropped })
    },
}

const DropCollect = (connect: DND.DropTargetConnector, monitor: DND.DropTargetMonitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
})

// Drop target type MUST match drag type
@DND.DropTarget<IDroppeable>(({ accepts }) => accepts, DropTarget, DropCollect)
export class Droppeable<P extends IDroppeable> extends React.Component<P> {
    public render() {
        const { isOver, connectDropTarget, canDrop } = this.props
        return connectDropTarget(<div>{this.props.render({ isOver, canDrop })}</div>)
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
 * @param {String | String[]} >props.target The target Type that responds to the drop
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
    onDrop: (item: any) => object
    accepts: string[] | string
    connectDropTarget?: any
    canDrop?: () => boolean
    dragTarget: string
    isDragging?: boolean
    connectDragSource?: any
    render: Render<{ canDrop?: () => boolean; isOver?: boolean; isDragging: boolean }>
}

/**
 * A component which can be dragged or dropped onto
 * @name DragAndDrop
 * @function
 */
@DND.DropTarget<IDragDrop>(props => props.accepts, DropTarget, DropCollect)
@DND.DragSource<IDragDrop>(props => props.dragTarget, DragSource, DragCollect)
export class DragAndDrop<P extends IDragDrop> extends React.Component<P> {
    public render() {
        const { isDragging, isOver, connectDragSource, connectDropTarget } = this.props
        return connectDropTarget(
            connectDragSource(<div>{this.props.render({ isDragging, isOver })}</div>),
        )
    }
}

export function DragAndDropContainer<State>(Container: React.ComponentClass<State>) {
    return DND.DragDropContext(HTML5Backend)(Container)
}
