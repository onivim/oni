/**
 * LiveEvaluation.ts
 */

import { EventEmitter } from "events"
import * as os from "os"
import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

/// <live>

import * as _ from "lodash"
_.take([1, 2, 3], 2)

/// </live>

/**
 * Implementation of the LiveEvaluation service
 */
export class LiveEvaluation extends EventEmitter {

    private _neovimInstance: INeovimInstance
    private _pluginManager: PluginManager
    private _keyToBlock: { [key: string]: ILiveCodeBlock } = {}

    private _bufferToBlocks: { [buffer: string]: ILiveCodeBlock[] } = {}

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        super()
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._neovimInstance.on("buffer-update", (context: Oni.EventContext, lines: string[]) => {

            const currentBlocks = getLiveCodeBlocks(lines)

            this._bufferToBlocks[context.bufferFullPath] = currentBlocks

            currentBlocks.forEach((b) => {
                const code = b.codeBlock.join(os.EOL)
                const key = context.bufferFullPath + "__" + b.startLine

                // If there was a previous result, bring it over
                if (this._keyToBlock[key]) {
                    b.result = this._keyToBlock[key].result
                }

                this._keyToBlock[key] = b
                this._pluginManager.requestEvaluateBlock(key, context.bufferFullPath, code)
            })

            this.emit("evaluate-block-result", context.bufferFullPath, currentBlocks)
        })

        this._pluginManager.on("evaluate-block-result", (res: any) => {
            const id = res.id
            const codeBlock = this._keyToBlock[id]

            if (!codeBlock) {
                return
            }

            codeBlock.result = res

            const fileName = res.fileName

            this.emit("evaluate-block-result", fileName, this._bufferToBlocks[fileName])
        })
    }
}

export interface ILiveCodeBlock {
    endLine: number
    startLine: number
    codeBlock: string[]

    result?: Oni.Plugin.EvaluationResult
}

function getLiveCodeBlocks(buffer: string[]): ILiveCodeBlock[] {

    let isInLiveBlock = false
    const result = buffer.reduce((prev: ILiveCodeBlock[], curr: string, idx: number) => {

        if (!isInLiveBlock) {
            if (curr.indexOf("<live>") >= 0
                && curr.indexOf("///") >= 0) {

                isInLiveBlock = true
                return prev.concat([{ startLine: idx + 1, codeBlock: [], endLine: -1 }])
            }
        } else {
            // const currentCodeBlock = prev[prev.length - 1]

            if (curr.indexOf("</live>") >= 0
                && curr.indexOf("///") >= 0) {
                isInLiveBlock = false
                prev[prev.length - 1].endLine = idx + 1
                return prev
            } else {
                prev[prev.length - 1].codeBlock.push(curr)
            }
        }

        return prev
    }, [])

    return result
}
