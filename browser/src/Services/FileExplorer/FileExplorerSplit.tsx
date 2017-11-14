/**
 * FileExplorerSplit.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import { Icon, IconSize } from "./../../UI/Icon"
import { Event } from "./../../Event"

import { INeovimMenuOption, NeovimMenuInstance } from "./../../neovim/NeovimMenuInstance"

import { KeyboardInputView } from "./../../Editor/KeyboardInput"

require("./FileExplorer.less")

import { FolderOrFile } from "./FileExplorerStore"

export interface IFileExplorerProps {
    rootPath: string
    filesOrFolders: FolderOrFile[],
    isLoading: boolean
    cursorPath: string
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

            const className = this.props.cursorPath === f.fullPath ? f.type + " cursor" : f.type

            if (f.type === "folder") {
                return <div className={className}>
                    <Icon className="icon" name="caret-right" />
                    <span className="name">{f.fullPath}</span>
                </div> 
            } else {
                return <div className={className}>
                    <Icon className="icon" name="file" />
                    <span className="name">{f.fullPath}</span>
                </div> 
            }

        })

        return <div className="tree">
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

    private _neovimInstance: NeovimMenuInstance<string>
    private _initPromise: Promise<void> = null

    constructor() {
        this._neovimInstance = new NeovimMenuInstance()

        this._neovimInstance.onCursorPositionChanged.subscribe((menuOption) => {
            fileExplorerStore.dispatch({
                type: "SET_CURSOR",
                cursorPath: menuOption.data,
            })
        })

        this._neovimInstance.start()
    }

    public enter(): void {
        this._onActive.dispatch()
        const filesAndFolders = fileExplorerStore.getState().filesOrFolders

        fileExplorerStore.dispatch({
            type: "SET_CURSOR",
            cursorPath: filesAndFolders[0].fullPath,
        })

        const options = filesAndFolders.map((f): INeovimMenuOption<string> => ({
            id: f.fullPath,
            data: f.fullPath,
        }))

        this._neovimInstance.setOptions(options)
    }

    public leave(): void {
        // alert("leave")
    }

    private async _onKeyDown(keyPress: string): Promise<void> {
        await this._initPromise
        this._neovimInstance.input(keyPress)
    }

    public render(): JSX.Element {

        const style = {
            width: "250px",
            fontFamily: "Segoe UI",
            fontSize: "12px",
        }

        return <div className="container horizontal fixed" style={{backgroundColor:"rgb(40, 44, 52)"}}>
        <div className="sidebar enable-mouse">
            <div className="sidebar-icon-container">
                <div className="sidebar-icon">
                    <Icon name="files-o" size={IconSize.Large} />
                </div>
            </div>
        </div>
        <div style={style}>
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
                    onKeyDown={(key) => this._onKeyDown(key)}
                    foregroundColor= {"white"}
                    fontFamily={ "Segoe UI"}
                    fontSize={"12px"}
                    fontCharacterWidthInPixels={12}
                    />
            </div>
            </div>
        </div>
    }
}
