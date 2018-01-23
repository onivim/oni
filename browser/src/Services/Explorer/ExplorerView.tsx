/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { connect } from "react-redux"

import { IEvent } from "oni-types"

import { KeyboardInputView } from "./../../Input/KeyboardInput"

import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { IExplorerState } from "./ExplorerStore"

require("./Explorer.less") // tslint:disable-line

export interface IFileViewProps {
    fileName: string
    isSelected: boolean
    indentationLevel: number
}

const INDENT_AMOUNT = 6

export class FileView extends React.PureComponent<IFileViewProps, {}> {
    public render(): JSX.Element {
        const style = {
            paddingLeft: (INDENT_AMOUNT * this.props.indentationLevel).toString() + "px",
            borderLeft: this.props.isSelected ? "4px solid rgb(97, 175, 239)" : "4px solid transparent",
            backgroundColor: this.props.isSelected ? "rgba(97, 175, 239, 0.1)" : "transparent",
        }
        return <div className="item" style={style}>
                <div className="icon"><FileIcon fileName={this.props.fileName} isLarge={true}/></div>
                <div className="name">{this.props.fileName}</div>
            </div>
    }
}

export interface INodeViewProps {
    node: ExplorerSelectors.ExplorerNode
    isSelected: boolean
}

export class NodeView extends React.PureComponent<INodeViewProps, {}> {
    public render(): JSX.Element {
        const node = this.props.node

        switch (node.type) {
            case "file":
                return <FileView fileName={node.name} isSelected={this.props.isSelected} indentationLevel={node.indentationLevel}/>
            case "container":
                return <ContainerView expanded={node.expanded} name={node.name} isContainer={true} isSelected={this.props.isSelected}/>
            case "folder":
                return <ContainerView expanded={node.expanded} name={node.name} isContainer={false} isSelected={this.props.isSelected} indentationLevel={node.indentationLevel}/>
            default:
                return <div>{JSON.stringify(node)}</div>
        }
    }
}

export interface IContainerViewProps {
    isContainer: boolean
    expanded: boolean
    name: string
    isSelected: boolean
    indentationLevel?: number
}

export class ContainerView extends React.PureComponent<IContainerViewProps, {}> {
    public render(): JSX.Element {

        const indentLevel = this.props.indentationLevel || 0

        const headerStyle = {
            paddingLeft: (indentLevel * INDENT_AMOUNT).toString() + "px",
            backgroundColor: this.props.isContainer ? "#1e2127" : this.props.isSelected ? "rgba(97, 175, 239, 0.1)" : "transparent",
            borderLeft: this.props.isSelected ? "4px solid rgb(97, 175, 239)" : "4px solid transparent",
        }

        const caretStyle = {
            transform: this.props.expanded ? "rotateZ(45deg)" : "rotateZ(0deg)",
        }

        return <div className="item" style={headerStyle}>
            <div className="icon">
                <i style={caretStyle} className="fa fa-caret-right" />
            </div>
            <div className="name">
                {this.props.name}
            </div>
        </div>
    }
}

export interface IExplorerContainerProps {
    onEnter: IEvent<void>
}

export interface IExplorerViewProps extends IExplorerContainerProps {
    nodes: ExplorerSelectors.ExplorerNode[]
    // selectedId: string
    // recentFiles: IRecentFile[]
    // workspaceRoot: string
}

export interface IVimNavigatorProps {
    // activateOnMount: boolean
    ids: string[]

    onEnter: IEvent<void>

    render: (selectedId: string) => JSX.Element
}

export interface IVimNavigatorState {
    selectedId: string
}

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

export class VimNavigator extends React.PureComponent<IVimNavigatorProps, IVimNavigatorState> {
    private _activeBinding: IMenuBinding = null

    constructor(props: IVimNavigatorProps) {
        super(props)

        this.state = {
            selectedId: null,
        }
    }

    public componentDidMount(): void {


        this.props.onEnter.subscribe(() => {
            this._releaseBinding()
            this._activeBinding = getInstance().bindToMenu()

            this._activeBinding.onCursorMoved.subscribe((newValue) => {
                this.setState({
                    selectedId: newValue,
                })
            })
        })
    }

    public componentDidUpdate(newProps: IVimNavigatorProps, newState: IVimNavigatorState): void {
        if (newProps.ids !== this.props.ids && this._activeBinding) {
            this._activeBinding.setItems(newProps.ids)
        }
    }

    public componentWillUnmount(): void {
        this._releaseBinding()
    }

    private _releaseBinding(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }
    }

    public render() {
        return <div>
                <div className="items">
                    {this.props.render(this.state.selectedId)}
                </div>
                <div className="input">
                    <KeyboardInputView
                        top={0}
                        left={0}
                        height={12}
                        onActivate={this.props.onEnter}
                        onKeyDown={(key) => this._onKeyDown(key)}
                        foregroundColor={"white"}
                        fontFamily={"Segoe UI"}
                        fontSize={"12px"}
                        fontCharacterWidthInPixels={12}

                        />
                </div>
            </div>
    }

    private _onKeyDown(key: string): void {
        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }
}

export class ExplorerView extends React.PureComponent<IExplorerViewProps, {}> {

    public render(): JSX.Element {

        const ids = this.props.nodes.map((node) => node.id)

        return <VimNavigator 
                ids={ids}
                onEnter={this.props.onEnter}
                render={(selectedId: string) => {
                const nodes = this.props.nodes.map((node) => <NodeView node={node} isSelected={node.id === selectedId}/>)

                return <div className="explorer enable-mouse">
                        <div className="items">
                            {nodes}
                        </div>
                    </div>
                }} />
    }
}

const mapStateToProps = (state: IExplorerState, containerProps: IExplorerContainerProps): IExplorerViewProps => {
    return {
        ...containerProps,
        nodes: ExplorerSelectors.mapStateToNodeList(state),
        // selectedId: state.selectedId,
    }
}

export const Explorer = connect(mapStateToProps)(ExplorerView)
