/**
 * SyntaxHighlightingPeridiocJob.ts
 *
 * Periodic (asynchronous) job to process syntax highlights
 */

import { Store } from "redux"

import * as types from "vscode-languageserver-types"

import { IGrammar } from "vscode-textmate"

import * as SyntaxHighlighting from "./SyntaxHighlightingStore"

import { IPeriodicJob } from "./../../PeriodicJobs"

export class SyntaxHighlightingPeriodicJob implements IPeriodicJob {

    private _batchSize: number = 50

    constructor(
        private _store: Store<SyntaxHighlighting.ISyntaxHighlightState>,
        private _bufferId: string,
        private _grammar: IGrammar,
        private _topLine: number,
        private _bottomLine: number,
    ) {
    }

    public execute(): boolean {

        let iterations = 0

        while (iterations < this._batchSize) {
            const currentState = this._store.getState()
            const bufferState = currentState.bufferToHighlights[this._bufferId]

            if (!bufferState) {
                return true
            }

            const anyDirty = this._tokenizeFirstDirtyLine(bufferState)

            if (!anyDirty) {
                return true
            }

            iterations++
        }

        return false
    }

    private _tokenizeFirstDirtyLine(state: SyntaxHighlighting.IBufferSyntaxHighlightState): boolean {

        let index = this._topLine

        while (index <= this._bottomLine) {

            const line = state.lines[index]

            if (!line) {
                break
            }

            if (!line.dirty) {
                index++
                continue
            }

            const previousStack = index === 0 ? null : state.lines[index - 1].ruleStack
            const tokenizeResult = this._grammar.tokenizeLine(line.line, previousStack)

            const tokens = tokenizeResult.tokens.map((t: any) => ({
                range: types.Range.create(index, t.startIndex, index, t.endIndex),
                scopes: t.scopes,
            }))

            const ruleStack = tokenizeResult.ruleStack

            this._store.dispatch({
                type: "SYNTAX_UPDATE_TOKENS_FOR_LINE",
                bufferId: state.bufferId,
                lineNumber: index,
                tokens,
                ruleStack,
            })

            return true
        }

        return false
    }
}
