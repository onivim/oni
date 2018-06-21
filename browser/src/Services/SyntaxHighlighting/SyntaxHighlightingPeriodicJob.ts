/**
 * SyntaxHighlightingPeridiocJob.ts
 *
 * Periodic (asynchronous) job to process syntax highlights
 */

import { Store } from "redux"

import * as types from "vscode-languageserver-types"
import { IGrammar } from "vscode-textmate"

import * as Log from "oni-core-logging"

import * as SyntaxHighlighting from "./SyntaxHighlightingStore"
import * as Selectors from "./SyntaxHighlightSelectors"

import { IPeriodicJob } from "./../../PeriodicJobs"

export const SYNTAX_JOB_BUDGET = 10 // Budget in milliseconds - time to allow the job to run for

export class SyntaxHighlightingPeriodicJob implements IPeriodicJob {
    constructor(
        private _store: Store<SyntaxHighlighting.ISyntaxHighlightState>,
        private _bufferId: string,
        private _grammar: IGrammar,
        private _topLine: number,
        private _bottomLine: number,
    ) {}

    public execute(): boolean {
        const start = new Date().getTime()

        // If the window has changed, we should bail
        const currentWindow = Selectors.getRelevantRange(this._store.getState(), this._bufferId)

        if (currentWindow.top !== this._topLine || currentWindow.bottom !== this._bottomLine) {
            Log.verbose(
                "[SyntaxHighlightingPeriodicJob.execute] Completing without doing work, as window size has changed.",
            )
            return true
        }

        while (true) {
            const current = new Date().getTime()

            if (current - start > SYNTAX_JOB_BUDGET) {
                Log.verbose(
                    "[SyntaxHighlightingPeriodicJob.execute] Pending due to exceeding budget.",
                )
                return false
            }

            const currentState = this._store.getState()
            const bufferState = currentState.bufferToHighlights[this._bufferId]

            if (!bufferState) {
                return true
            }

            const anyDirty = this._tokenizeFirstDirtyLine(bufferState)

            if (!anyDirty) {
                return true
            }
        }
    }

    private _tokenizeFirstDirtyLine(
        state: SyntaxHighlighting.IBufferSyntaxHighlightState,
    ): boolean {
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
                version: state.version,
            })

            return true
        }

        return false
    }
}
