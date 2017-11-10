/**
 * FileExplorerSplit.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import { Icon } from "./../../UI/Icon"

require("./FileExplorer.less")

import { FolderOrFile } from "./FileExplorerStore"

export interface IFileExplorerProps {
    rootPath: string
    filesOrFolders: FolderOrFile[],
    isLoading: boolean
}

export class FileExplorerView extends React.PureComponent<IFileExplorerProps, {}> {

    public render(): JSX.Element {

        const sortedFilesAndFolders = this.props.filesOrFolders.sort((a, b) => {
            if (a.type < b.type) {
                return 1
            } else if(a.type > b.type) {
                return -1
            } else {
                if (a.fullPath < b.fullPath) {
                    return -1
                } else {
                    return 1
                }
            }
        })

        const elements = sortedFilesAndFolders.map((f) => {
            if (f.type === "folder") {
                return <div className="folder">
                    <Icon className="icon" name="caret-right" />
                    <span className="name">{f.fullPath}</span>
                </div> 
            } else {
                return <div className="file">
                    <Icon className="icon" name="file" />
                    <span className="name">{f.fullPath}</span>
                </div> 
            }

        })

        return <div>
            <div>{this.props.rootPath}</div>
            {elements}
        </div>

    }
}

import { connect, Provider } from "react-redux"

import { fileExplorerStore, IFileExplorerState } from "./FileExplorerStore"

const mapStateToProps = (state: IFileExplorerState): IFileExplorerProps => {
    return state
}

const FileExplorer = connect(mapStateToProps)(FileExplorerView)

export class FileExplorerSplit implements Oni.IWindowSplit {

    public render(): JSX.Element {

        const style = {
            width: "250px",
            fontFamily: "Segoe UI",
            fontSize: "12px",
            color: "gray",
        }

        return <div style={style}>
        
        <div className="file-explorer enable-mouse">
            <div className="title">Project</div>
            <Provider store={fileExplorerStore}>
                <FileExplorer />
            </Provider>
        </div>
        </div>
    }
}
