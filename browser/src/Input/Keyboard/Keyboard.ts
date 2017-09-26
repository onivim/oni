import { EventEmitter } from "events"

import * as Log from "./../../Log"

import { keyboardLayout } from "./KeyboardLayout"
import { createMetaKeyResolver, ignoreMetaKeyResolver, KeyResolver, remapResolver  } from "./Resolvers"

export class Keyboard extends EventEmitter {
    constructor() {
        super()

        const resolvers: KeyResolver[] = [
            ignoreMetaKeyResolver,
            remapResolver,
            createMetaKeyResolver(keyboardLayout.getCurrentKeyMap()),
        ]

        document.body.addEventListener("keydown", (evt) => {
            /*
             * This prevents the opening and immediate
             * (unwanted) closing of external windows.
             * This problem seems to only exist in Mac OS.
             */
            if (evt.keyCode === 13) {
                evt.preventDefault()
            }

            const mappedKey = resolvers.reduce((prev: string, current) => {
                if (prev === null) {
                    return prev
                } else {
                    return current(evt, prev)
                }
            }, evt.key)

            Log.debug(`[Key event] Code: ${evt.code} Key: ${evt.key} CtrlKey: ${evt.ctrlKey} ShiftKey: ${evt.shiftKey} AltKey: ${evt.altKey} | Resolution: ${mappedKey}`)

            if (mappedKey) {
                this.emit("keydown", mappedKey)
            }
        })
    }
}
