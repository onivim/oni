/**
 * FileExplorerSplit.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import { Icon } from "./../../UI/Icon"
import { Event } from "./../../Event"

import { KeyboardInputView } from "./../../Editor/KeyboardInput"

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

    private _onActive: Event<void> = new Event<void>()

    public enter(): void {
        this._onActive.dispatch()
        // alert("enter")
    }

    public leave(): void {
        // alert("leave")
    }

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
            <KeyboardInputView
                top={0}
                left={0}
                height={12}
                onActivate={this._onActive}
                onKeyDown={() => console.log("Keydown")}
                foregroundColor= {"white"}
                fontFamily={ "Segoe UI"}
                fontSize={"12px"}
                fontCharacterWidthInPixels={12}
                />
        </div>
        </div>
    }
}
