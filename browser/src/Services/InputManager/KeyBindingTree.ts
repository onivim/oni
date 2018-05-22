export type ActionFunction = () => boolean

export type ActionOrCommand = string | ActionFunction

export type FilterFunction = () => boolean

export type KeyBinding = {
    action: ActionOrCommand
    filter?: FilterFunction
}

export type KeyBindingTree = {
    children: { [keyBinding: string]: KeyBindingTree }
    bindings: KeyBinding[]
}

export const create = (): KeyBindingTree => {
    return {
        children: {},
        bindings: [],
    }
}

export const isPotentialChord = (keys: string[], tree: KeyBindingTree): boolean => {
    return false
}

export const getKeyBindingsForChord = (keys: string): KeyBinding[] => {
    return []
}

export const setKeyBindingsForChord = (
    keys: string,
    binding: KeyBinding[],
    tree: KeyBindingTree,
): KeyBindingTree => {
    return tree
}

export const isTerminal = (keys: string[], tree: KeyBindingTree): boolean => {
    return false
}
