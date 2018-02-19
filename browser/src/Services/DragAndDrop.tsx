import * as React from "react"
import * as DND from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"

type Render<T> = (props: T) => React.ReactElement<T>

// Drop Target ================================================================
export interface IDroppeable {
    isOver?: boolean
    connectDropTarget?: any
    render: Render<{ isOver?: boolean; connectDropTarget?: DND.DropTargetConnector }>
}

interface IDroppeableArgs<T> {
    Type: string
    Target: DND.DropTargetSpec<T>
    Collect: DND.DropTargetCollector
}

// drop target type MUST match drag type
export function Droppeable<Props>({ Type, Target, Collect }: IDroppeableArgs<Props>) {
    class DroppeableComponent extends React.Component<IDroppeable & Props> {
        public render() {
            const { isOver, connectDropTarget } = this.props
            return connectDropTarget(<div>{this.props.render({ isOver })}</div>)
        }
    }
    return DND.DropTarget<IDroppeable & Props>(Type, Target, Collect)(DroppeableComponent)
}

// Drag Source ================================================================
export interface IDraggeable {
    isDragging?: boolean
    connectDragSource?: any
    render: Render<{ isDragging?: boolean; connectDragSource?: DND.DragSourceConnector }>
}

interface IDraggeableArgs<T> {
    Type: string
    Source: DND.DragSourceSpec<T>
    Collect: DND.DragSourceCollector
}

export function Draggeable<Props>({ Type, Source, Collect }: IDraggeableArgs<Props>) {
    class DraggeableComponent extends React.Component<IDraggeable & Props> {
        public render() {
            const { isDragging, connectDragSource } = this.props
            return connectDragSource(<div>{this.props.render({ isDragging })}</div>)
        }
    }
    return DND.DragSource<IDraggeable & Props>(Type, Source, Collect)(DraggeableComponent)
}

export function DragAndDropContainer<State>(Container: React.ComponentClass<State>) {
    return DND.DragDropContext(HTML5Backend)(Container)
}

interface IDragDropArgs<Props> {
    types: string[]
    dragCollect: DND.DragSourceCollector
    dropCollect: DND.DropTargetCollector
    source: DND.DragSourceSpec<Props>
    dragType: string
    target: DND.DropTargetSpec<Props>
}

interface IDragDrop {
    isOver?: boolean
    connectDropTarget?: any
    isDragging?: boolean
    connectDragSource?: any
    render: Render<{ isOver?: boolean; isDragging: boolean }>
}

export function DragDrop<Props>({
    types,
    dragCollect,
    dropCollect,
    source,
    dragType,
    target,
}: IDragDropArgs<Props>) {
    type FullProps = IDragDrop & Props
    class DragDropComponent extends React.Component<FullProps> {
        public render() {
            const { isDragging, isOver } = this.props
            return this.props.render({ isDragging, isOver })
        }
    }
    const Drop = DND.DropTarget<FullProps>(types, target, dropCollect)(DragDropComponent)
    const DragAndDrop = DND.DragSource<FullProps>(dragType, source, dragCollect)(Drop)
    return DragAndDrop
}
