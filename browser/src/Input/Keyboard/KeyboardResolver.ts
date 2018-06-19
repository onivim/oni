/**
 * KeyboardResolver
 *
 * Manages set of resolvers, and adding/removing resolvers.
 */
import * as Log from "oni-core-logging"
import { IDisposable } from "oni-types"

import { KeyResolver } from "./Resolvers"

export class KeyboardResolver {
    private _resolvers: KeyResolver[] = []

    public addResolver(resolver: KeyResolver): IDisposable {
        this._resolvers.push(resolver)
        const dispose = () => {
            this._resolvers = this._resolvers.filter(r => r !== resolver)
        }

        return {
            dispose,
        }
    }

    public resolveKeyEvent(evt: KeyboardEvent): string | null {
        const mappedKey = this._resolvers.reduce((prev: string, current) => {
            if (prev === null) {
                return prev
            } else {
                return current(evt, prev)
            }
        }, evt.key)

        if (Log.isDebugLoggingEnabled()) {
            Log.debug(
                `[Key event] Code: ${evt.code} Key: ${evt.key} CtrlKey: ${evt.ctrlKey} ShiftKey: ${
                    evt.shiftKey
                } AltKey: ${evt.altKey} | Resolution: ${mappedKey}`,
            )
        }

        return mappedKey
    }
}
