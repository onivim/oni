import * as React from "react"
import * as DND from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"

type Render<T> = (props: T) => React.ReactElement<T>

// Drop Target ================================================================
export interface IDroppeable {
    isOver?: boolean
    connectDropTarget?: any
    onDrop: (item: object) => object
    canDrop: () => boolean
    accepts: string[] | string
    render: Render<{
        canDrop: () => boolean
        isOver?: boolean
        connectDropTarget?: DND.DropTargetConnector
    }>
}

const DropTarget = {
    drop(props: { onDrop: (item: object) => object }, monitor: DND.DropTargetMonitor) {
        const item = monitor.getItem()
        return props.onDrop({ ...item, ...props })
    },
}

const DropCollect = (connect: DND.DropTargetConnector, monitor: DND.DropTargetMonitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
})

// drop target type MUST match drag type
class DroppeableComponent extends React.Component<IDroppeable> {
    public render() {
        const { isOver, connectDropTarget, canDrop } = this.props
        return connectDropTarget(<div>{this.props.render({ isOver, canDrop })}</div>)
    }
}

export const Droppeable = DND.DropTarget<IDroppeable>(
    ({ accepts }) => accepts,
    DropTarget,
    DropCollect,
)(DroppeableComponent)

// Drag Source ================================================================
export interface IDraggeable {
    target?: string
    isDragging?: boolean
    connectDragSource?: any
    render: Render<{ isDragging?: boolean; connectDragSource?: DND.DragSourceConnector }>
}

const DragSource = {
    beginDrag(props) {
        return props
    },
}

const DragCollect = (connect: DND.DragSourceConnector, monitor: DND.DragSourceMonitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

class DraggeableComponent extends React.Component<IDraggeable> {
    public render() {
        const { isDragging, connectDragSource } = this.props
        return connectDragSource(<div>{this.props.render({ isDragging })}</div>)
    }
}

export const Draggeable = DND.DragSource<IDraggeable>(
    props => props.target,
    DragSource,
    DragCollect,
)(DraggeableComponent)

interface IDragDrop {
    isOver?: boolean
    onDrop: (item: object) => object
    accepts: string[] | string
    connectDropTarget?: any
    canDrop?: () => boolean
    dragTarget: string
    isDragging?: boolean
    connectDragSource?: any
    render: Render<{ canDrop?: () => boolean; isOver?: boolean; isDragging: boolean }>
}

class DragDropComponent extends React.Component<IDragDrop> {
    public render() {
        const { isDragging, isOver, connectDragSource, connectDropTarget } = this.props
        return connectDropTarget(
            connectDragSource(<div>{this.props.render({ isDragging, isOver })}</div>),
        )
    }
}
const Drop = DND.DropTarget<IDragDrop>(props => props.accepts, DropTarget, DropCollect)(
    DragDropComponent,
)
export const DragAndDrop = DND.DragSource<IDragDrop>(
    props => props.dragTarget,
    DragSource,
    DragCollect,
)(Drop)

export function DragAndDropContainer<State>(Container: React.ComponentClass<State>) {
    return DND.DragDropContext(HTML5Backend)(Container)
}
