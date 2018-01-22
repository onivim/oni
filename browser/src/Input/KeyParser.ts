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
}

export interface IKeyChord {
    chord: IKey[]
}

export const parseKeysFromVimString = (keys: string): IKeyChord => {
    return {
        chord: []
    }
}

export const parseKey = (key: string): IKey => {
    return {
        character: "",
        shift: false,
        alt: false,
        control: false,
    }
}
