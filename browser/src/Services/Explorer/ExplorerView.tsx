/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import * as DND from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import { connect } from "react-redux"
import { compose } from "redux"

import styled from "styled-components"

import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { Draggeable, Droppeable } from "./../DragAndDrop"

import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { IExplorerState } from "./ExplorerStore"

export interface INodeViewProps {
    moveFile: (fileId: string, folderId: string) => void
    node: ExplorerSelectors.ExplorerNode
    isSelected: boolean
    onClick: () => void
}

interface IFolderDroppeable {
    moveFile: (fileId: string, folderId: string) => void
    folderId?: string
}

interface IFileDraggeable {
    filename?: string
    fileId?: string
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

function fileCollect(fileConnect: DND.DragSourceConnector, monitor: DND.DragSourceMonitor) {
    return {
        connectDragSource: fileConnect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

const Types = {
    file: "FILE",
    folder: "FOLDER",
}

const FileSource = {
    beginDrag(props: IFileDraggeable) {
        return {
            filename: props.filename,
            fileId: props.fileId,
        }
    },
}

function folderCollect(folderConnect: DND.DropTargetConnector, monitor: DND.DropTargetMonitor) {
    return {
        connectDropTarget: folderConnect.dropTarget(),
        isOver: monitor.isOver(),
    }
}

const FolderTarget = {
    drop(props: IFolderDroppeable, monitor: DND.DropTargetMonitor) {
        const file = monitor.getItem() as { fileId: string }
        props.moveFile(file.fileId, props.folderId)
        return { ...props, file }
    },
}

const DraggeableComponent = Draggeable<IFileDraggeable>(Types.file, FileSource, fileCollect)
const DroppeableComponent = Droppeable<IFolderDroppeable>(Types.file, FolderTarget, folderCollect)

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
                        filename={node.name}
                        fileId={node.id}
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
                    <DroppeableComponent
                        moveFile={this.props.moveFile}
                        render={({ isOver }) => {
                            return (
                                <SidebarContainerView
                                    isOver={isOver}
                                    isContainer={true}
                                    isExpanded={node.expanded}
                                    text={node.name}
                                    isFocused={this.props.isSelected}
                                />
                            )
                        }}
                    />
                )
            case "folder":
                return (
                    <DroppeableComponent
                        folderId={node.id}
                        moveFile={this.props.moveFile}
                        render={({ isOver }) => {
                            return (
                                <SidebarContainerView
                                    isOver={isOver}
                                    isContainer={false}
                                    isExpanded={node.expanded}
                                    text={node.name}
                                    isFocused={this.props.isSelected}
                                    indentationLevel={node.indentationLevel}
                                />
                            )
                        }}
                    />
                )
            default:
                return <div>{JSON.stringify(node)}</div>
        }
    }
}

export interface IExplorerViewContainerProps {
    moveFile: (fileId: string, folderId: string) => void
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
                                moveFile={this.props.moveFile}
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

export const Explorer = compose(connect(mapStateToProps), DND.DragDropContext(HTML5Backend))(
    ExplorerView,
)
