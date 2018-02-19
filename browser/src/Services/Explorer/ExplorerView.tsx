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
import { DragAndDrop, Droppeable } from "./../DragAndDrop"

import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { IExplorerState } from "./ExplorerStore"

type Node = ExplorerSelectors.ExplorerNode

export interface INodeViewProps {
    moveFile: (source: Node, dest: Node) => void
    moveFolder: (source: Node, dest: Node) => void
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

const Types = {
    FILE: "FILE",
    FOLDER: "FOLDER",
}

interface IMoveNode {
    drop: {
        node: ExplorerSelectors.ExplorerNode
    }
    drag: {
        node: ExplorerSelectors.ExplorerNode
    }
}

export class NodeView extends React.PureComponent<INodeViewProps, {}> {
    public moveFile = ({ drag, drop }: IMoveNode) => {
        this.props.moveFile(drag.node, drop.node)
    }

    public moveFolder = ({ drag, drop }: IMoveNode) => {
        this.props.moveFolder(drag.node, drop.node)
    }

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
                    <DragAndDrop
                        onDrop={this.moveFile}
                        dragTarget={Types.FILE}
                        accepts={[Types.FILE, Types.FOLDER]}
                        canDrop={() => true}
                        node={node}
                        render={({ canDrop, isOver }) => {
                            return (
                                <SidebarItemView
                                    isOver={isOver}
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
                    <Droppeable
                        accepts={[Types.FILE, Types.FOLDER]}
                        onDrop={this.moveFile}
                        canDrop={() => true}
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
                    <DragAndDrop
                        accepts={[Types.FILE, Types.FOLDER]}
                        dragTarget={Types.FOLDER}
                        canDrop={() => true}
                        onDrop={props => this.moveFolder(props)}
                        node={node}
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
    moveFile: (source: Node, dest: Node) => void
    moveFolder: (source: Node, dest: Node) => void
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
                                moveFolder={this.props.moveFolder}
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
