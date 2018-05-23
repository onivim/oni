export const CursorGotoType = "CURSOR_GOTO_ACTION"
export const PutAction = "PUT_ACTION"
export const CLEAR_TO_END_OF_LINE = "CLEAR_TO_END_OF_LINE"
export const RESIZE = "RESIZE"
export const CLEAR = "CLEAR"
export const SET_FONT = "SET_FONT"
export const CHANGE_MODE = "CHANGE_MODE"
export const UPDATE_BG = "UPDATE_BG"
export const UPDATE_FG = "UPDATE_FG"
export const UPDATE_SP = "UPDATE_SP"
export const SET_HIGHLIGHT = "SET_HIGHLIGHT"

export const SET_SCROLL_REGION = "SET_SCROLL_REGION"
export const SCROLL = "SCROLL"

export interface IAction {
    type: string
}

export interface ICursorGotoAction extends IAction {
    row: number
    col: number
}

export interface IResizeAction extends IAction {
    rows: number
    columns: number
}

export interface IPutCharacterAction extends IAction {
    characters: string[]
}

export interface IChangeModeAction extends IAction {
    mode: string
}

export interface IKeyboardInputAction extends IAction {
    input: string
}

interface ISetFontArguments {
    fontFamily: string
    fontSize: string
    fontWeight: string
    fontWidthInPixels: number
    fontHeightInPixels: number
    linePaddingInPixels: number
    isItalicAvailable: boolean
    isBoldAvailable: boolean
}

export interface ISetFontAction extends IAction {
    fontFamily: string
    fontSize: string
    fontWeight: string
    fontWidthInPixels: number
    fontHeightInPixels: number
    linePaddingInPixels: number
    isItalicAvailable: boolean
    isBoldAvailable: boolean
}

export interface IScrollAction extends IAction {
    scroll: number
}

export interface ISetScrollRegionAction extends IAction {
    top: number
    bottom: number
    left: number
    right: number
}

export interface IUpdateColorAction extends IAction {
    color: string
}

export interface ISetHighlightAction extends IAction {
    bold: boolean
    italic: boolean
    reverse: boolean
    underline: boolean
    undercurl: boolean

    foregroundColor?: string
    backgroundColor?: string
}

export function scroll(scrollValue: number): IScrollAction {
    return {
        type: SCROLL,
        scroll: scrollValue,
    }
}

export function setScrollRegion(
    top: number,
    bottom: number,
    left: number,
    right: number,
): ISetScrollRegionAction {
    return {
        type: SET_SCROLL_REGION,
        top,
        bottom,
        left,
        right,
    }
}

export function setHighlight(
    bold: boolean,
    italic: boolean,
    reverse: boolean,
    underline: boolean,
    undercurl: boolean,
    foregroundColor?: number,
    backgroundColor?: number,
): ISetHighlightAction {
    const action: ISetHighlightAction = {
        type: SET_HIGHLIGHT,
        bold,
        italic,
        reverse,
        underline,
        undercurl,
        foregroundColor: undefined,
        backgroundColor: undefined,
    }

    if (foregroundColor && foregroundColor !== -1) {
        action.foregroundColor = colorToString(foregroundColor, "#FFFFFF")
    }

    if (backgroundColor && backgroundColor !== -1) {
        action.backgroundColor = colorToString(backgroundColor, "#000000")
    }

    return action
}

export const CommandLineShow = (
    content: [any, string],
    pos: number,
    firstc: string,
    prompt: string,
    indent: number,
    level: number,
) => ({
    type: "COMMAND_LINE_SHOW",
    payload: {
        content,
        pos,
        firstc,
        prompt,
        indent,
        level,
    },
})

function colorToString(color: number, defaultColor: string): string {
    if (color === -1) {
        return defaultColor
    }

    // tslint:disable no-bitwise
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    // tslint:enable no-bitwise

    return "#" + _convertToHexString(r) + _convertToHexString(g) + _convertToHexString(b)
}

function _convertToHexString(num: number): string {
    let hex: string = num.toString(16)
    if (hex.length === 1) {
        hex = "0" + hex
    }

    return hex
}

export function updateBackground(color: number): IUpdateColorAction {
    return {
        type: UPDATE_BG,
        color: colorToString(color, "#000000"),
    }
}

export function updateForeground(color: number): IUpdateColorAction {
    return {
        type: UPDATE_FG,
        color: colorToString(color, "#FFFFFF"),
    }
}

export function changeMode(mode: string): IChangeModeAction {
    return {
        type: CHANGE_MODE,
        mode,
    }
}

export function setFont({
    fontFamily,
    fontSize,
    fontWeight,
    fontWidthInPixels,
    fontHeightInPixels,
    linePaddingInPixels,
    isItalicAvailable,
    isBoldAvailable,
}: ISetFontArguments): ISetFontAction {
    return {
        type: SET_FONT,
        fontFamily,
        fontSize,
        fontWeight,
        fontWidthInPixels,
        fontHeightInPixels,
        linePaddingInPixels,
        isItalicAvailable,
        isBoldAvailable,
    }
}

export function clear(): IAction {
    return {
        type: CLEAR,
    }
}

export function resize(columns: number, rows: number): IResizeAction {
    return {
        type: RESIZE,
        rows,
        columns,
    }
}

export function put(characters: string[]): IPutCharacterAction {
    return {
        type: PutAction,
        characters,
    }
}

export function clearToEndOfLine(): IAction {
    return {
        type: CLEAR_TO_END_OF_LINE,
    }
}

export function createKeyboardInputAction(key: string): IKeyboardInputAction {
    return {
        type: "KeyboardInputAction",
        input: key,
    }
}

export function createCursorGotoAction(row: number, col: number): ICursorGotoAction {
    return {
        type: CursorGotoType,
        row,
        col,
    }
}

export const createStartNeovimAction = () => {
    return {
        type: "StartNeovimAction",
    }
}

export const createKeyboardInitializeAction = () => {
    return {
        type: "KeyboardInitialize",
    }
}
