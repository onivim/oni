import { IKeyInfo, IKeyMap, KeyboardLayoutManager } from "./KeyboardLayout"

/**
 * Interface describing a 'key resolver' - a strategy
 * for resolving a keyboard event to a vim-facing input event.
 *
 * Key resolvers are intended to be chained together.
 *
 * If a key resolver returns null, it will prevent processing that key.
 */
export type KeyResolver = (evt: KeyboardEvent, previousResolution: string | null) => string | null

const keysToIgnore = [
    "Shift",
    "Control",
    "Alt",
    "AltGraph",
    "CapsLock",
    "Pause",
    "ScrollLock",
    "AudioVolumeUp",
    "AudioVolumeDown",
]

export const ignoreMetaKeyResolver = (
    evt: KeyboardEvent,
    previousResolution: string | null,
): string | null => {
    if (keysToIgnore.indexOf(evt.key) >= 0) {
        return null
    } else {
        return evt.key
    }
}

const keysToRemap: { [key: string]: string } = {
    Backspace: "bs",
    Escape: "esc",
    Enter: "enter",
    Tab: "tab", // Tab
    ArrowLeft: "left", // ArrowLeft
    ArrowUp: "up", // ArrowUp
    ArrowRight: "right", // ArrowRight
    ArrowDown: "down", // ArrowDown
    Insert: "insert",
    " ": "space",
}

export const remapResolver = (
    evt: KeyboardEvent,
    previousResolution: string | null,
): string | null => {
    return keysToRemap[evt.key] ? keysToRemap[evt.key] : previousResolution
}

export const getMetaKeyResolver = () => {
    const keyboardLayout: KeyboardLayoutManager = new KeyboardLayoutManager()

    let keyMap = keyboardLayout.getCurrentKeyMap()

    keyboardLayout.onKeyMapChanged.subscribe(() => {
        keyMap = keyboardLayout.getCurrentKeyMap()
    })

    return (evt: KeyboardEvent, previousResolution: string | null): null | string => {
        const isCharacterFromShiftKey = isShiftCharacter(keyMap, evt)
        const isCharacterFromAltGraphKey = isAltGraphCharacter(keyMap, evt)

        let mappedKey = previousResolution

        if (mappedKey === "<") {
            mappedKey = "lt"
        }

        const metaPressed = evt.metaKey

        let controlPressed = false
        // On Windows, when the AltGr key is pressed, _both_
        // the evt.ctrlKey and evt.altKey are set to true.
        if (evt.ctrlKey && !isCharacterFromAltGraphKey) {
            mappedKey = "c-" + previousResolution + ""
            controlPressed = true
            evt.preventDefault()
        }

        if (evt.shiftKey && (!isCharacterFromShiftKey || controlPressed || metaPressed)) {
            mappedKey = "s-" + mappedKey
        }

        if (evt.altKey && !isCharacterFromAltGraphKey) {
            mappedKey = "a-" + mappedKey
            evt.preventDefault()
        }

        if (metaPressed) {
            mappedKey = "m-" + mappedKey
            evt.preventDefault()
        }

        if (mappedKey.length > 1) {
            mappedKey = "<" + mappedKey.toLowerCase() + ">"
        }

        return mappedKey
    }
}

export const createMetaKeyResolver = (keyMap: IKeyMap) => {
    return (evt: KeyboardEvent, previousResolution: string | null): null | string => {
        const isCharacterFromShiftKey = isShiftCharacter(keyMap, evt)
        const isCharacterFromAltGraphKey = isAltGraphCharacter(keyMap, evt)

        let mappedKey = previousResolution

        if (mappedKey === "<") {
            mappedKey = "lt"
        }

        const metaPressed = evt.metaKey

        let controlPressed = false
        // On Windows, when the AltGr key is pressed, _both_
        // the evt.ctrlKey and evt.altKey are set to true.
        if (evt.ctrlKey && !isCharacterFromAltGraphKey) {
            mappedKey = "c-" + previousResolution + ""
            controlPressed = true
            evt.preventDefault()
        }

        if (evt.shiftKey && (!isCharacterFromShiftKey || controlPressed || metaPressed)) {
            mappedKey = "s-" + mappedKey
        }

        if (evt.altKey && !isCharacterFromAltGraphKey) {
            mappedKey = "a-" + mappedKey
            evt.preventDefault()
        }

        if (metaPressed) {
            mappedKey = "m-" + mappedKey
            evt.preventDefault()
        }

        if (mappedKey.length > 1) {
            mappedKey = "<" + mappedKey.toLowerCase() + ">"
        }

        return mappedKey
    }
}

const isShiftCharacter = (keyMap: IKeyMap, evt: KeyboardEvent): boolean => {
    const { key, code } = evt

    const mappedKey: IKeyInfo = keyMap[code]

    if (!mappedKey) {
        return false
    }

    if (code === "Space") {
        return false
    }

    if (mappedKey.withShift === key || mappedKey.withAltGraphShift === key) {
        return true
    } else {
        return false
    }
}

const isAltGraphCharacter = (keyMap: IKeyMap, evt: KeyboardEvent): boolean => {
    const { key, code } = evt

    const mappedKey: IKeyInfo = keyMap[code]

    if (!mappedKey) {
        return false
    }

    if (mappedKey.withAltGraph === key || mappedKey.withAltGraphShift === key) {
        return true
    } else {
        return false
    }
}
