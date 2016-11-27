/**
 * LiveEvaluation.ts
 */

import * as os from "os"

import { INeovimInstance } from "./../NeovimInstance"
import { BufferInfo, PluginManager } from "./../Plugins/PluginManager"

/**
 * Implementation of the LiveEvaluation service
 */
export class LiveEvaluation {

    private _neovimInstance: INeovimInstance
    private _pluginManager: PluginManager

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._neovimInstance.on("buffer-update", (context: Oni.EventContext, lines: string[]) => {

            const currentBlocks = getLiveCodeBlocks(lines)

            currentBlocks.forEach(b => {
                const code = b.codeBlock.join(os.EOL)
                this._pluginManager.requestEvaluateBlock(code)
            })
        })

        this._pluginManager.on("evaluate-block-result", (res) => {
            alert(JSON.stringify(res))
        })
    }
}

interface LiveCodeBlock {
    startLine: number,
    codeBlock: string[]
}

function getLiveCodeBlocks(buffer: string[]): LiveCodeBlock[] {

    let isInLiveBlock = false
    const result = buffer.reduce((prev: LiveCodeBlock[], curr: string, idx: number) => {

        if (!isInLiveBlock) {
            if (curr.indexOf("<live>") >= 0
                && curr.indexOf("///") >= 0) {

                isInLiveBlock = true
                return prev.concat([{ startLine: idx, codeBlock: [] }])
            }
        } else {
            const currentCodeBlock = prev[prev.length - 1]

            if (curr.indexOf("</live>") >= 0
                && curr.indexOf("///") >= 0) {
                isInLiveBlock = false
                return prev
            } else {
                prev[prev.length - 1].codeBlock.push(curr)
            }
        }

        return prev
    }, [])

    return result
}
