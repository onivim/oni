/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import * as DND from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import { connect } from "react-redux"
import { compose } from "redux"

import { CSSTransition, TransitionGroup } from "react-transition-group"

import { styled } from "./../../UI/components/common"
import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { Sneakable } from "./../../UI/components/Sneakable"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { DragAndDrop, Droppeable } from "./../DragAndDrop"

import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { IExplorerState } from "./ExplorerStore"

type Node = ExplorerSelectors.ExplorerNode

export interface INodeViewProps {
    moveFileOrFolder: (source: Node, dest: Node) => void
    node: ExplorerSelectors.ExplorerNode
    isSelected: boolean
    onClick: () => void
    yanked: string[]
    updated?: string[]
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
const stopPropagation = (fn: () => void) => {
    return (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        fn()
    }
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

const NodeTransitionWrapper = styled.div`
    transition: all 400ms 50ms ease-in-out;

    &.move-enter {
        opacity: 0.01;
        transform: scale(0.9);
    }

    &.move-enter-active {
        transform: scale(1);
        opacity: 1;
    }
`

interface ITransitionProps {
    children: React.ReactNode
    updated: boolean
}

const Transition = ({ children, updated }: ITransitionProps) => (
    <CSSTransition in={updated} classNames="move" timeout={1000}>
        <NodeTransitionWrapper className={updated && "move"}>{children}</NodeTransitionWrapper>
    </CSSTransition>
)

export class NodeView extends React.PureComponent<INodeViewProps, {}> {
    public moveFileOrFolder = ({ drag, drop }: IMoveNode) => {
        this.props.moveFileOrFolder(drag.node, drop.node)
    }

    public isSameNode = ({ drag, drop }: IMoveNode) => {
        return !(drag.node.name === drop.node.name)
    }

    public render(): JSX.Element {
        return (
            <NodeWrapper
                style={{ cursor: "pointer" }}
                innerRef={this.props.isSelected ? scrollIntoViewIfNeeded : noop}
            >
                {this.getElement()}
            </NodeWrapper>
        )
    }

    public hasUpdated = (path: string) =>
        !!this.props.updated && this.props.updated.some(nodePath => nodePath === path)

    public getElement(): JSX.Element {
        const { node } = this.props
        const yanked = this.props.yanked.includes(node.id)

        switch (node.type) {
            case "file":
                return (
                    <DragAndDrop
                        onDrop={this.moveFileOrFolder}
                        dragTarget={Types.FILE}
                        accepts={[Types.FILE, Types.FOLDER]}
                        isValidDrop={this.isSameNode}
                        node={node}
                        render={({ canDrop, isDragging, didDrop, isOver }) => {
                            const updated = this.hasUpdated(node.filePath)
                            return (
                                <Transition updated={updated}>
                                    <SidebarItemView
                                        updated={updated}
                                        yanked={yanked}
                                        isOver={isOver && canDrop}
                                        didDrop={didDrop}
                                        canDrop={canDrop}
                                        text={node.name}
                                        isFocused={this.props.isSelected}
                                        isContainer={false}
                                        indentationLevel={node.indentationLevel}
                                        onClick={stopPropagation(this.props.onClick)}
                                        icon={<FileIcon fileName={node.name} isLarge={true} />}
                                    />
                                </Transition>
                            )
                        }}
                    />
                )
            case "container":
                return (
                    <Droppeable
                        accepts={[Types.FILE, Types.FOLDER]}
                        onDrop={this.moveFileOrFolder}
                        isValidDrop={() => true}
                        render={({ isOver }) => {
                            return (
                                <SidebarContainerView
                                    yanked={yanked}
                                    isOver={isOver}
                                    isContainer={true}
                                    isExpanded={node.expanded}
                                    text={node.name}
                                    isFocused={this.props.isSelected}
                                    onClick={stopPropagation(this.props.onClick)}
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
                        isValidDrop={this.isSameNode}
                        onDrop={this.moveFileOrFolder}
                        node={node}
                        render={({ isOver, didDrop, canDrop }) => {
                            const updated = this.hasUpdated(node.folderPath)
                            return (
                                <Transition updated={updated}>
                                    <SidebarContainerView
                                        yanked={yanked}
                                        updated={updated}
                                        didDrop={didDrop}
                                        isOver={isOver && canDrop}
                                        isContainer={false}
                                        isExpanded={node.expanded}
                                        text={node.name}
                                        isFocused={this.props.isSelected}
                                        indentationLevel={node.indentationLevel}
                                        onClick={stopPropagation(this.props.onClick)}
                                    />
                                </Transition>
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
    moveFileOrFolder: (source: Node, dest: Node) => void
    onSelectionChanged: (id: string) => void
    onClick: (id: string) => void
    yanked?: string[]
}

export interface IExplorerViewProps extends IExplorerViewContainerProps {
    nodes: ExplorerSelectors.ExplorerNode[]
    isActive: boolean
    updated: string[]
}

import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"

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
            <TransitionGroup>
                <VimNavigator
                    ids={ids}
                    active={this.props.isActive}
                    onSelectionChanged={this.props.onSelectionChanged}
                    onSelected={id => this.props.onClick(id)}
                    render={(selectedId: string) => {
                        const nodes = this.props.nodes.map(node => (
                            <Sneakable callback={() => this.props.onClick(node.id)} key={node.id}>
                                <NodeView
                                    updated={this.props.updated}
                                    yanked={this.props.yanked}
                                    moveFileOrFolder={this.props.moveFileOrFolder}
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
            </TransitionGroup>
        )
    }
}

const mapStateToProps = (
    state: IExplorerState,
    containerProps: IExplorerViewContainerProps,
): IExplorerViewProps => {
    const yanked = state.register.yank.map(node => node.id)
    return {
        ...containerProps,
        isActive: state.hasFocus,
        nodes: ExplorerSelectors.mapStateToNodeList(state),
        updated: state.register.updated,
        yanked,
    }
}

export const Explorer = compose(connect(mapStateToProps), DND.DragDropContext(HTML5Backend))(
    ExplorerView,
)
