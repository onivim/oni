/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import * as DND from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import { connect } from "react-redux"
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized"
import { compose } from "redux"

import { CSSTransition, TransitionGroup } from "react-transition-group"

import { css, enableMouse, styled } from "./../../UI/components/common"
import { TextInputView } from "./../../UI/components/LightweightText"
import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { Sneakable } from "./../../UI/components/Sneakable"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { DragAndDrop, Droppeable } from "./../DragAndDrop"

import { commandManager } from "./../CommandManager"
import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { getPathForNode, IExplorerState } from "./ExplorerStore"

type Node = ExplorerSelectors.ExplorerNode

export interface INodeViewProps {
    moveFileOrFolder: (source: Node, dest: Node) => void
    node: ExplorerSelectors.ExplorerNode
    isSelected: boolean
    onClick: () => void
    onCancelRename: () => void
    onCompleteRename: (newName: string) => void
    onCancelCreate?: () => void
    onCompleteCreate?: (path: string) => void
    yanked: string[]
    updated?: string[]
    isRenaming: Node
    isCreating: boolean
    children?: React.ReactNode
}

const stopPropagation = (fn: () => void) => {
    return (e?: React.MouseEvent<HTMLElement>) => {
        if (e) {
            e.stopPropagation()
        }
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

export const NodeWrapper = styled.div`
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
`

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

const renameStyles = css`
    width: 100%;
    background-color: inherit;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    padding: 0.5em;
    box-sizing: border-box;
    border: 2px solid ${p => p.theme["highlight.mode.normal.background"]} !important;
`

const createStyles = css`
    ${renameStyles};
    margin-top: 0.2em;
`

const Transition = ({ children, updated }: ITransitionProps) => (
    <CSSTransition in={updated} classNames="move" timeout={1000}>
        <NodeTransitionWrapper className={updated && "move"}>{children}</NodeTransitionWrapper>
    </CSSTransition>
)

export class NodeView extends React.PureComponent<INodeViewProps> {
    public moveFileOrFolder = ({ drag, drop }: IMoveNode) => {
        this.props.moveFileOrFolder(drag.node, drop.node)
    }

    public isSameNode = ({ drag, drop }: IMoveNode) => {
        return !(drag.node.name === drop.node.name)
    }

    public render() {
        const { isCreating, isRenaming, isSelected, node } = this.props
        const renameInProgress = isRenaming.name === node.name && isSelected && !isCreating
        const creationInProgress = isCreating && isSelected && !renameInProgress
        return (
            <NodeWrapper>
                {renameInProgress ? (
                    <TextInputView
                        styles={renameStyles}
                        onCancel={this.props.onCancelRename}
                        onComplete={this.props.onCompleteRename}
                    />
                ) : (
                    <div>
                        {this.getElement()}
                        {creationInProgress && (
                            <TextInputView
                                styles={createStyles}
                                onCancel={this.props.onCancelCreate}
                                onComplete={this.props.onCompleteCreate}
                            />
                        )}
                    </div>
                )}
            </NodeWrapper>
        )
    }

    public hasUpdated = (path: string) =>
        !!this.props.updated && this.props.updated.some(nodePath => nodePath === path)

    public getElement() {
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
    onCancelRename: () => void
    onCompleteRename: (newName: string) => void
    yanked?: string[]
    isCreating?: boolean
    isRenaming?: Node
    onCancelCreate?: () => void
    onCompleteCreate?: (path: string) => void
}

export interface IExplorerViewProps extends IExplorerViewContainerProps {
    nodes: ExplorerSelectors.ExplorerNode[]
    isActive: boolean
    updated: string[]
    idToSelect: string
}

interface ISneakableNode extends IExplorerViewProps {
    node: Node
    selectedId: string
}

const SneakableNode = ({ node, selectedId, ...props }: ISneakableNode) => (
    <Sneakable callback={() => props.onClick(node.id)}>
        <NodeView
            node={node}
            isSelected={node.id === selectedId}
            isCreating={props.isCreating}
            onCancelCreate={props.onCancelCreate}
            onCompleteCreate={props.onCompleteCreate}
            onCompleteRename={props.onCompleteRename}
            isRenaming={props.isRenaming}
            onCancelRename={props.onCancelRename}
            updated={props.updated}
            yanked={props.yanked}
            moveFileOrFolder={props.moveFileOrFolder}
            onClick={() => props.onClick(node.id)}
        />
    </Sneakable>
)

const ExplorerContainer = styled.div`
    height: 100%;
    ${enableMouse};
`

export class ExplorerView extends React.PureComponent<IExplorerViewProps> {
    private _list = React.createRef<List>()

    private _cache = new CellMeasurerCache({
        defaultHeight: 30,
        fixedWidth: true,
    })

    public openWorkspaceFolder = () => {
        commandManager.executeCommand("workspace.openFolder")
    }

    public getSelectedNode = (selectedId: string) => {
        return this.props.nodes.findIndex(n => selectedId === n.id)
    }

    public propsChanged(keys: Array<keyof IExplorerViewProps>, prevProps: IExplorerViewProps) {
        return keys.some(prop => this.props[prop] !== prevProps[prop])
    }

    public componentDidUpdate(prevProps: IExplorerViewProps) {
        if (this.propsChanged(["isCreating", "isRenaming", "yanked"], prevProps)) {
            // TODO: if we could determine which nodes actually were involved
            // in the change this could potentially be optimised
            this._cache.clearAll()
            this._list.current.recomputeRowHeights()
        }
    }

    public render() {
        const ids = this.props.nodes.map(node => node.id)
        const isActive = this.props.isActive && !this.props.isRenaming && !this.props.isCreating

        if (!this.props.nodes || !this.props.nodes.length) {
            return (
                <SidebarEmptyPaneView
                    active={this.props.isActive}
                    contentsText="Nothing to show here, yet!"
                    actionButtonText="Open a Folder"
                    onClickButton={this.openWorkspaceFolder}
                />
            )
        }

        return (
            <TransitionGroup style={{ height: "100%" }}>
                <VimNavigator
                    ids={ids}
                    active={isActive}
                    style={{ height: "100%" }}
                    idToSelect={this.props.idToSelect}
                    onSelected={id => this.props.onClick(id)}
                    onSelectionChanged={this.props.onSelectionChanged}
                    render={selectedId => {
                        return (
                            <ExplorerContainer className="explorer">
                                <AutoSizer>
                                    {measurements => (
                                        <List
                                            {...measurements}
                                            ref={this._list}
                                            scrollToAlignment="end"
                                            style={{ outline: "none" }}
                                            rowCount={this.props.nodes.length}
                                            rowHeight={this._cache.rowHeight}
                                            scrollToIndex={this.getSelectedNode(selectedId)}
                                            rowRenderer={({ index, style, key, parent }) => (
                                                <CellMeasurer
                                                    key={key}
                                                    cache={this._cache}
                                                    columnIndex={0}
                                                    parent={parent}
                                                    rowIndex={index}
                                                >
                                                    <div
                                                        style={style}
                                                        key={this.props.nodes[index].id}
                                                    >
                                                        <SneakableNode
                                                            {...this.props}
                                                            selectedId={selectedId}
                                                            node={this.props.nodes[index]}
                                                        />
                                                    </div>
                                                </CellMeasurer>
                                            )}
                                        />
                                    )}
                                </AutoSizer>
                            </ExplorerContainer>
                        )
                    }}
                />
            </TransitionGroup>
        )
    }
}

const getIdToSelect = (fileToSelect: string, nodes: ExplorerSelectors.ExplorerNode[]) => {
    // If parent has told us to select a file, attempt to convert the file path into a node ID.
    if (fileToSelect) {
        const [nodeToSelect] = nodes.filter(node => {
            const nodePath = getPathForNode(node)
            return nodePath === fileToSelect
        })

        return nodeToSelect ? nodeToSelect.id : null
    }
    return null
}

const mapStateToProps = (
    state: IExplorerState,
    containerProps: IExplorerViewContainerProps,
): IExplorerViewProps => {
    const yanked = state.register.yank.map(node => node.id)
    const {
        register: { updated, rename },
        fileToSelect,
    } = state

    const nodes: ExplorerSelectors.ExplorerNode[] = ExplorerSelectors.mapStateToNodeList(state)

    return {
        ...containerProps,
        isActive: state.hasFocus,
        nodes,
        updated,
        yanked,
        idToSelect: getIdToSelect(fileToSelect, nodes),
        isCreating: state.register.create.active,
        isRenaming: rename.active && rename.target,
    }
}

export const Explorer = compose(connect(mapStateToProps), DND.DragDropContext(HTML5Backend))(
    ExplorerView,
)
