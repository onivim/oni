import * as Log from "./../../Log"

import { keyboardLayout } from "./KeyboardLayout"
import { createMetaKeyResolver, ignoreMetaKeyResolver, KeyResolver, remapResolver  } from "./Resolvers"

const resolvers: KeyResolver[] = [
    ignoreMetaKeyResolver,
    remapResolver,
    createMetaKeyResolver(keyboardLayout.getCurrentKeyMap()),
]

export const keyEventToVimKey = (evt: KeyboardEvent): string | null => {
    const mappedKey = resolvers.reduce((prev: string, current) => {
        if (prev === null) {
            return prev
        } else {
            return current(evt, prev)
        }
    }, evt.key)

    Log.debug(`[Key event] Code: ${evt.code} Key: ${evt.key} CtrlKey: ${evt.ctrlKey} ShiftKey: ${evt.shiftKey} AltKey: ${evt.altKey} | Resolution: ${mappedKey}`)

    return mappedKey
}
