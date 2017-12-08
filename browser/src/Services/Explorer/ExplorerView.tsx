/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { connect } from "react-redux"
import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { IExplorerState } from "./ExplorerStore"

export interface IFileViewProps {
    fileName: string
}

export class FileView extends React.PureComponent<IFileViewProps, {}> {
    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            padding: "4px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        }

        const fileIconStyle: React.CSSProperties = {
            flex: "0 0 auto",
            width: "20px",
        }

        const textStyle: React.CSSProperties = {
            flex: "1 1 auto"
        }

        return <div style={containerStyle}>
                <div style={fileIconStyle}><FileIcon fileName={this.props.fileName} isLarge={true}/></div>
                <div style={textStyle}>{this.props.fileName}</div>
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
                return <ContainerView expanded={node.expanded} name={node.name} />
            default:
                return <div>{JSON.stringify(node)}</div>
        }
    }
}

export interface IContainerViewProps {
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

        const iconStyle = {
            margin: "4px",
        }
        return <div style={headerStyle}>
            <i style={iconStyle} className="fa fa-caret-right" />
            <span>{this.props.name}</span>
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

        return <div style={containerStyle} className="enable-mouse">
                <div style={tabStyle}>Explorer</div>
                <div>
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
