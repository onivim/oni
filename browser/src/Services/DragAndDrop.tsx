import * as React from "react"
import * as DND from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"

type Render<T> = (props: T) => React.ReactElement<T>

export interface IDroppeable {
    isOver?: boolean
    connectDropTarget?: any
    render: Render<{ isOver?: boolean; connectDropTarget?: DND.DropTargetConnector }>
}

// Drop Target ================================================================

// drop target type MUST match drag type
export function Droppeable<Props>(
    Type: string,
    Target: DND.DropTargetSpec<Props>,
    Collect: DND.DropTargetCollector,
) {
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
    render: Render<{ isDragging?: boolean; connectDragSource?: any }>
}

export function Draggeable<Props>(
    Type: string,
    Source: DND.DragSourceSpec<Props>,
    Collect: DND.DragSourceCollector,
) {
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
