/**
 * KeyParser.ts
 *
 * Simple parsing logic to take vim key bindings / chords,
 * and return a normalized object.
 */

export interface IKey {
    character: string
    shift: boolean
    alt: boolean
    control: boolean
    meta: boolean
}

export interface IKeyChord {
    chord: IKey[]
}

export const parseKeysFromVimString = (keys: string): IKeyChord => {
    const chord: IKey[] = []

    let idx = 0

    while (idx < keys.length) {
        if (keys[idx] !== "<") {
            chord.push(parseKey(keys[idx]))
        } else {
            const endIndex = getNextCharacter(keys, idx + 1)
            // Malformed if there isn't a corresponding '>'
            if (endIndex === -1) {
                return { chord }
            }

            const keyContents = keys.substring(idx + 1, endIndex)
            chord.push(parseKey(keyContents))
            idx = endIndex + 1
        }

        idx++
    }

    return {
        chord,
    }
}

const getNextCharacter = (str: string, startIndex: number): number => {
    let i = startIndex
    while (i < str.length) {
        if (str[i] === ">") {
            return i
        }
        i++
    }

    return -1
}

export const parseKey = (key: string): IKey => {
    if (key.indexOf("-") === -1) {
        return {
            character: key,
            shift: false,
            alt: false,
            control: false,
            meta: false,
        }
    }

    const hasControl = key.indexOf("c-") >= 0 || key.indexOf("C-") >= 0
    const hasShift = key.indexOf("s-") >= 0 || key.indexOf("S-") >= 0
    const hasAlt = key.indexOf("a-") >= 0 || key.indexOf("A-") >= 0
    const hasMeta = key.indexOf("m-") >= 0 || key.indexOf("M-") >= 0

    const lastIndexoFHyphen = key.lastIndexOf("-")
    const finalKey = key.substring(lastIndexoFHyphen + 1, key.length)

    return {
        character: finalKey,
        shift: hasShift,
        alt: hasAlt,
        control: hasControl,
        meta: hasMeta,
    }
}
