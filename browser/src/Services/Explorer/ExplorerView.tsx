/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { connect } from "react-redux"
import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { IExplorerState } from "./ExplorerStore"

require("./Explorer.less") // tslint:disable-line

export interface IFileViewProps {
    fileName: string
}

export class FileView extends React.PureComponent<IFileViewProps, {}> {
    public render(): JSX.Element {
        return <div className="item">
                <div className="icon"><FileIcon fileName={this.props.fileName} isLarge={true}/></div>
                <div className="name">{this.props.fileName}</div>
            </div>
    }
}

export interface INodeViewProps {
    node: ExplorerSelectors.ExplorerNode
}

export class NodeView extends React.PureComponent<INodeViewProps, {}> {
    public render(): JSX.Element {
        const node = this.props.node

        switch (node.type) {
            case "file":
                return <FileView fileName={node.filePath} />
            case "container":
                return <ContainerView expanded={node.expanded} name={node.name} isContainer={true}/>
            case "folder":
                return <ContainerView expanded={node.expanded} name={node.folderPath} isContainer={false}/>
            default:
                return <div>{JSON.stringify(node)}</div>
        }
    }
}

export interface IContainerViewProps {
    isContainer: boolean
    expanded: boolean
    name: string
}

export class ContainerView extends React.PureComponent<IContainerViewProps, {}> {
    public render(): JSX.Element {
        
        const headerStyle = {
            // boxShadow: "inset 0px 1px 8px 1px rgba(0, 0, 0, 0.1), inset 0px -1px 8px 1px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#1e2127",
            // padding: "8px",
        }

        const style = this.props.isContainer ? headerStyle : null

        return <div className="item" style={style}>
            <div className="icon">
                <i className="fa fa-caret-right" />
            </div>
            <div className="name">
                {this.props.name}
            </div>
        </div>
    }
}

export interface IExplorerViewProps {
    nodes: ExplorerSelectors.ExplorerNode[]
    // recentFiles: IRecentFile[]
    // workspaceRoot: string
}


export class ExplorerView extends React.PureComponent<IExplorerViewProps, {}> {

    public render(): JSX.Element {

        const containerStyle = {
            width: "200px",
            color: "rgb(171, 179, 191)",
            backgroundColor: "rgb(40, 44, 52)",
            height: "100%"
        }

        const tabStyle = {
            height: "2.5em",
            lineHeight: "2.5em",
            textAlign: "center",
            fontSize: "13px",
            fontFamily: "Segoe UI",
        }

        // const recentFiles = this.props.recentFiles.map((rf) => <RecentFileView fileName={rf.filePath} />)

        const nodes = this.props.nodes.map((node) => <NodeView node={node} />)

        return <div style={containerStyle} className="explorer enable-mouse">
                <div className="header" style={tabStyle}>Explorer</div>
                <div className="items">
                    {nodes}
                </div>
            </div>
    }
}

// Linear mapping of state -> tree

const mapStateToProps = (state: IExplorerState): IExplorerViewProps => {
    return {
        nodes: ExplorerSelectors.mapStateToNodeList(state)
    }
}

export const Explorer = connect(mapStateToProps)(ExplorerView)
