/**
 * FileExplorerSplit.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import * as fs from "fs"

import { Icon } from "./../../UI/Icon"

require("./FileExplorer.less")

export class FileExplorerSplit implements Oni.IWindowSplit {

    public render(): JSX.Element {

        const style = {
            width: "250px",
            fontFamily: "Segoe UI",
            fontSize: "12px",
            color: "gray",
        }

        const dir = process.cwd()
        const files = fs.readdirSync(dir)

        const elements = files.map((f) => {

            const stat = fs.statSync(f)

            if (stat.isDirectory()) {
                return <div className="folder">
                    <Icon className="icon" name="caret-right" />
                    <span className="name">{f}</span>
                </div> 
            } else {
                return <div className="file">
                    <Icon className="icon" name="file" />
                    <span className="name">{f}</span>
                </div> 
            }
        })

        return <div style={style}>
        
        <div className="file-explorer enable-mouse">
            <div className="title">Project</div>
            {elements}
        </div>
        </div>
    }
}
