/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { DragDropContext, DragSource, DragSourceConnector, DragSourceMonitor } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import { connect } from "react-redux"
import { compose } from "redux"

import styled from "styled-components"

import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { IExplorerState } from "./ExplorerStore"

export interface INodeViewProps {
    node: ExplorerSelectors.ExplorerNode
    isSelected: boolean
    onClick: () => void
}

const NodeWrapper = styled.div`
    &:hover {
        text-decoration: underline;
    }
`

// tslint:disable-next-line
const noop = (elem: HTMLElement) => {}
const scrollIntoViewIfNeeded = (elem: HTMLElement) => {
    // tslint:disable-next-line
    elem && elem["scrollIntoViewIfNeeded"] && elem["scrollIntoViewIfNeeded"]()
}

const FileSource = {
    beginDrag(props: any) {
        return {
            fileId: props.filename,
        }
    },
}

function fileCollect(fileConnect: DragSourceConnector, monitor: DragSourceMonitor) {
    return {
        connectDragSource: fileConnect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

const Types = {
    file: "FILE",
}

interface IDraggeable {
    isDragging?: boolean
    connectDragSource?: any
    render: (p: { isDragging?: boolean; connectDragSource?: any }) => React.ReactNode
}

@DragSource<IDraggeable>(Types.file, FileSource, fileCollect)
class DraggeableComponent extends React.Component<IDraggeable> {
    public render() {
        const { isDragging, connectDragSource } = this.props
        return connectDragSource(<div>{this.props.render({ isDragging })}</div>)
    }
}

export class NodeView extends React.PureComponent<INodeViewProps, {}> {
    public render(): JSX.Element {
        return (
            <NodeWrapper
                style={{ cursor: "pointer" }}
                onClick={() => this.props.onClick()}
                innerRef={this.props.isSelected ? scrollIntoViewIfNeeded : noop}
            >
                {this.getElement()}
            </NodeWrapper>
        )
    }

    public getElement(): JSX.Element {
        const { node } = this.props

        switch (node.type) {
            case "file":
                return (
                    <DraggeableComponent
                        render={({ isDragging }) => {
                            return (
                                <SidebarItemView
                                    text={node.name}
                                    isFocused={this.props.isSelected}
                                    isContainer={false}
                                    indentationLevel={node.indentationLevel}
                                    icon={<FileIcon fileName={node.name} isLarge={true} />}
                                />
                            )
                        }}
                    />
                )
            case "container":
                return (
                    <SidebarContainerView
                        isContainer={true}
                        isExpanded={node.expanded}
                        text={node.name}
                        isFocused={this.props.isSelected}
                    />
                )
            case "folder":
                return (
                    <SidebarContainerView
                        isContainer={false}
                        isExpanded={node.expanded}
                        text={node.name}
                        isFocused={this.props.isSelected}
                        indentationLevel={node.indentationLevel}
                    />
                )
            default:
                return <div>{JSON.stringify(node)}</div>
        }
    }
}

export interface IExplorerViewContainerProps {
    onSelectionChanged: (id: string) => void
    onClick: (id: string) => void
}

export interface IExplorerViewProps extends IExplorerViewContainerProps {
    nodes: ExplorerSelectors.ExplorerNode[]
    isActive: boolean
}

import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { Sneakable } from "./../../UI/components/Sneakable"

import { commandManager } from "./../CommandManager"

export class ExplorerView extends React.PureComponent<IExplorerViewProps, {}> {
    public render(): JSX.Element {
        const ids = this.props.nodes.map(node => node.id)

        if (!this.props.nodes || !this.props.nodes.length) {
            return (
                <SidebarEmptyPaneView
                    active={this.props.isActive}
                    contentsText="Nothing to show here, yet!"
                    actionButtonText="Open a Folder"
                    onClickButton={() => commandManager.executeCommand("workspace.openFolder")}
                />
            )
        }

        return (
            <VimNavigator
                ids={ids}
                active={this.props.isActive}
                onSelectionChanged={this.props.onSelectionChanged}
                onSelected={id => this.props.onClick(id)}
                render={(selectedId: string) => {
                    const nodes = this.props.nodes.map(node => (
                        <Sneakable callback={() => this.props.onClick(node.id)} key={node.id}>
                            <NodeView
                                node={node}
                                isSelected={node.id === selectedId}
                                onClick={() => this.props.onClick(node.id)}
                            />
                        </Sneakable>
                    ))

                    return (
                        <div className="explorer enable-mouse">
                            <div className="items">{nodes}</div>
                        </div>
                    )
                }}
            />
        )
    }
}

const mapStateToProps = (
    state: IExplorerState,
    containerProps: IExplorerViewContainerProps,
): IExplorerViewProps => {
    return {
        ...containerProps,
        isActive: state.hasFocus,
        nodes: ExplorerSelectors.mapStateToNodeList(state),
    }
}

export const Explorer = compose(connect(mapStateToProps), DragDropContext(HTML5Backend))(
    ExplorerView,
)
