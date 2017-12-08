/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { connect } from "react-redux"
import { FileIcon } from "./../FileIcon"

import { IExplorerState, IRecentFile } from "./ExplorerStore"

export interface IRecentFileViewProps {
    fileName: string
    isModified?: boolean
}

export class RecentFileView extends React.PureComponent<IRecentFileViewProps, {}> {
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

        const modifiedIconStyle: React.CSSProperties = {
            flex: "0 0 auto",
            width: "20px",
        }

        return <div style={containerStyle}>
                <div style={fileIconStyle}><FileIcon fileName={this.props.fileName} isLarge={true}/></div>
                <div style={textStyle}>{this.props.fileName}</div>
                <div style={modifiedIconStyle}></div>
            </div>
    }
}

export interface IExplorerViewProps {
    recentFiles: IRecentFile[]
    workspaceRoot: string
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

        const headerStyle = {
            // boxShadow: "inset 0px 1px 8px 1px rgba(0, 0, 0, 0.1), inset 0px -1px 8px 1px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#1e2127",
            // padding: "8px",
        }

        const iconStyle = {
            margin: "4px",
        }

        const recentFiles = this.props.recentFiles.map((rf) => <RecentFileView fileName={rf.filePath} />)

        return <div style={containerStyle} className="enable-mouse">
                <div style={tabStyle}>Explorer</div>

                <div>
                    <div style={headerStyle}>
                        <i style={iconStyle} className="fa fa-caret-down" />
                        <span>Open Buffers</span>
                    </div>
                    <div>
                        {recentFiles}
                    </div>
                    <div style={headerStyle}>
                        <i style={iconStyle} className="fa fa-caret-right" />
                        <span>{this.props.workspaceRoot}</span>
                    </div>
                </div>
            </div>
    }
}

// Linear mapping of state -> tree

const mapStateToProps = (state: IExplorerState): IExplorerViewProps => {
    return {
        recentFiles: state.openedFiles,
        workspaceRoot: state.rootFolder.fullPath,
    }
}

export const Explorer = connect(mapStateToProps)(ExplorerView)
