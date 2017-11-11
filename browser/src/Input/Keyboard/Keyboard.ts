import * as Log from "./../../Log"

import { keyboardLayout } from "./KeyboardLayout"
import { createMetaKeyResolver, ignoreMetaKeyResolver, KeyResolver, remapResolver  } from "./Resolvers"

const rebuildResolvers = (): KeyResolver[] => {
    return [
        ignoreMetaKeyResolver,
        remapResolver,
        createMetaKeyResolver(keyboardLayout.getCurrentKeyMap()),
    ]
}

let resolvers: KeyResolver[] = rebuildResolvers()

keyboardLayout.onKeyMapChanged.subscribe(() => {
    resolvers = rebuildResolvers()
})

export const keyEventToVimKey = (evt: KeyboardEvent): string | null => {
    const mappedKey = resolvers.reduce((prev: string, current) => {
        if (prev === null) {
            return prev
        } else {
            return current(evt, prev)
        }
    }, evt.key)

    if (Log.isDebugLoggingEnabled()) {
        Log.debug(`[Key event] Code: ${evt.code} Key: ${evt.key} CtrlKey: ${evt.ctrlKey} ShiftKey: ${evt.shiftKey} AltKey: ${evt.altKey} | Resolution: ${mappedKey}`)
    }

    return mappedKey
}
