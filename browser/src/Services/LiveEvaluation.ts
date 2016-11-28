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
    private _currentBlocks: LiveCodeBlock[]

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._neovimInstance.on("buffer-update", (context: Oni.EventContext, lines: string[]) => {

            const currentBlocks = getLiveCodeBlocks(lines)
            this._currentBlocks = currentBlocks

            currentBlocks.forEach(b => {
                const code = b.codeBlock.join(os.EOL)
                this._pluginManager.requestEvaluateBlock(code, b.startLine)
            })
        })

        this._pluginManager.on("evaluate-block-result", (res) => {
            // TODO: Something useful here...
            console.warn(JSON.stringify(res))
        })
    }
}

export interface LiveCodeBlock {
    endLine: number
    startLine: number
    codeBlock: string[]
    result?: Oni.Plugin.EvaluationResult
}

function getLiveCodeBlocks(buffer: string[]): LiveCodeBlock[] {

    let isInLiveBlock = false
    const result = buffer.reduce((prev: LiveCodeBlock[], curr: string, idx: number) => {

        if (!isInLiveBlock) {
            if (curr.indexOf("<live>") >= 0
                && curr.indexOf("///") >= 0) {

                isInLiveBlock = true
                return prev.concat([{ startLine: idx, codeBlock: [], endLine: -1 }])
            }
        } else {
            const currentCodeBlock = prev[prev.length - 1]

            if (curr.indexOf("</live>") >= 0
                && curr.indexOf("///") >= 0) {
                isInLiveBlock = false
                prev[prev.length - 1].endLine = idx
                return prev
            } else {
                prev[prev.length - 1].codeBlock.push(curr)
            }
        }

        return prev
    }, [])

    return result
}
