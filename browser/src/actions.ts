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

export interface Action {
    type: string;
}



export interface StartNeovimAction extends Action {

}

export interface CursorGotoAction extends Action {
    row: number;
    col: number;
}

export interface ResizeAction extends Action {
    rows: number
    columns: number
}

export interface PutCharacterAction extends Action {
    characters: string[];
}

export interface ClearToEndOfLineAction extends Action {

}

export interface ClearAction extends Action {

}

export interface ChangeModeAction extends Action {
    mode: string
}

export interface KeyboardInputAction extends Action {
    input: string;
}

export interface SetFontAction extends Action {
    fontFamily: string;
    fontSize: string;
    fontWidthInPixels: number;
    fontHeightInPixels: number;
}

export interface ScrollAction extends Action {
    scroll: number
}

export interface SetScrollRegionAction extends Action {
    top: number
    bottom: number
    left: number
    right: number
}

export interface UpdateColorAction extends Action {
    color: string;
}

export interface SetHighlightAction extends Action {
    bold: boolean;
    italic: boolean;
    reverse: boolean;
    underline: boolean;
    undercurl: boolean;

    foregroundColor?: string;
    backgroundColor?: string
}

export function scroll(scroll: number): ScrollAction {
    return {
        type: SCROLL,
        scroll: scroll
    }
}

export function setScrollRegion(top: number, bottom: number, left: number, right: number): SetScrollRegionAction {
    return {
        type: SET_SCROLL_REGION,
        top: top,
        bottom: bottom,
        left: left,
        right: right
    }
}

export function setHighlight(bold: boolean, italic: boolean, reverse: boolean, underline: boolean, undercurl: boolean, foregroundColor?: number, backgroundColor?: number): SetHighlightAction {
    var action: SetHighlightAction = {
        type: SET_HIGHLIGHT,
        bold: bold,
        italic: italic,
        reverse: reverse,
        underline: underline,
        undercurl: undercurl,
        foregroundColor: null,
        backgroundColor: null
    }

    if(foregroundColor && foregroundColor !== -1) {
        action.foregroundColor = colorToString(foregroundColor, "#FFFFFF")
    }

    if(backgroundColor && backgroundColor !== -1) {
        action.backgroundColor = colorToString(backgroundColor, "#000000")
    }

    return action
}

function colorToString(color: number, defaultColor: string): string {
    if(color === -1)
        return defaultColor

    var r = (color >> 16) & 0xff
    var g = (color >> 8) & 0xff
    var b = color & 0xff

    return "#" + _convertToHexString(r) + _convertToHexString(g) + _convertToHexString(b)
}

function _convertToHexString(num: number): string {
    let hex: string = num.toString(16)
    if(hex.length === 1)
        hex = "0" + hex

    return hex
}

export function updateBackground(color: number): UpdateColorAction {
    return {
        type: UPDATE_BG,
        color: colorToString(color, "#000000")
    }
}

export function updateForeground(color: number): UpdateColorAction {
    return {
        type: UPDATE_FG,
        color: colorToString(color, "#FFFFFF")
    }
}

export function changeMode(mode: string): ChangeModeAction {
    return {
        type: CHANGE_MODE,
        mode: mode
    }
}

export function setFont(fontFamily: string, fontSize: string, fontWidthInPixels: number, fontHeightInPixels: number): SetFontAction {
    return {
        type: SET_FONT,
        fontFamily: fontFamily,
        fontSize: fontSize,
        fontWidthInPixels: fontWidthInPixels,
        fontHeightInPixels: fontHeightInPixels
    }
}

export function clear(): ClearAction {
    return {
        type: CLEAR
    }
}

export function resize(columns: number, rows: number): ResizeAction {
    return {
        type: RESIZE,
        rows: rows,
        columns: columns
    }
}

export function put(characters: string[]): PutCharacterAction {
    return {
        type: PutAction,
        characters: characters
    }
}

export function clearToEndOfLine(): ClearToEndOfLineAction {
    return {
        type: CLEAR_TO_END_OF_LINE
    }
}


export function createKeyboardInputAction(key: string): KeyboardInputAction {
    return {
        type: "KeyboardInputAction",
        input: key
    }
}

export function createCursorGotoAction(row: number, col: number): CursorGotoAction {
    return {
        type: CursorGotoType,
        row: row,
        col: col
    }
}

export var createStartNeovimAction = () => {
    return {
        type: "StartNeovimAction"
    }
}

export var createKeyboardInitializeAction = () => {
    return {
        type: "KeyboardInitialize"
    }
}