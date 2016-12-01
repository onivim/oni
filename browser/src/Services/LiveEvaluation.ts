/**
 * LiveEvaluation.ts
 */

import * as os from "os"
import { EventEmitter } from "events"

import { INeovimInstance } from "./../NeovimInstance"
import { BufferInfo, PluginManager } from "./../Plugins/PluginManager"

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
    private _keyToBlock: {[key: string]: LiveCodeBlock} = {}

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        super()
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._neovimInstance.on("buffer-update", (context: Oni.EventContext, lines: string[]) => {

            const currentBlocks = getLiveCodeBlocks(lines)

            currentBlocks.forEach(b => {
                const code = b.codeBlock.join(os.EOL)
                const key = context.bufferFullPath + "__" + b.startLine
                this._keyToBlock[key] = b
                this._pluginManager.requestEvaluateBlock(key, context.bufferFullPath, code)
            })
        })

        this._pluginManager.on("evaluate-block-result", (res) => {

            const id = res.id
            const codeBlock = this._keyToBlock[id]
            codeBlock.result = res

            this.emit("evaluate-block-result", res.fileName, id, codeBlock)
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
                return prev.concat([{ startLine: idx + 1, codeBlock: [], endLine: -1 }])
            }
        } else {
            const currentCodeBlock = prev[prev.length - 1]

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
