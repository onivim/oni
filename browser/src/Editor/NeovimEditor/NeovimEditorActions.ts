/**
 * ActionCreators.ts
 *
 * Action Creators are relatively simple - they are just a function that returns an `Action`
 *
 * For information on Action Creators, check out this link:
 * http://redux.js.org/docs/basics/Actions.html
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import * as State from "./NeovimEditorStore"

import { EventContext, InactiveBufferContext, IScreen } from "./../../neovim"
import { normalizePath } from "./../../Utility"

import { IConfigurationValues } from "./../../Services/Configuration"
import { Errors } from "./../../Services/Diagnostics"
import { IThemeColors } from "./../../Services/Themes"

import { IBufferLayer } from "./../NeovimEditor/BufferLayerManager"

export type DispatchFunction = (action: any) => void
export type GetStateFunction = () => State.IState

export interface ISetHasFocusAction {
    type: "SET_HAS_FOCUS"
    payload: {
        hasFocus: boolean
    }
}

export interface ISetLoadingCompleteAction {
    type: "SET_LOADING_COMPLETE"
}

export interface ISetColorsAction {
    type: "SET_COLORS"
    payload: {
        colors: IThemeColors
    }
}

export interface IAddBufferLayerAction {
    type: "ADD_BUFFER_LAYER"
    payload: {
        bufferId: number
        layer: IBufferLayer
    }
}

export interface IRemoveBufferLayerAction {
    type: "REMOVE_BUFFER_LAYER"
    payload: {
        bufferId: number
        layer: IBufferLayer
    }
}

export interface IUpdateBufferDecorationsAction {
    type: "UPDATE_DECORATIONS"
    payload: {
        decorations: State.IDecoration[]
        layerId: string
    }
}

export interface IClearBufferDecorationsAction {
    type: "CLEAR_DECORATIONS"
    payload: {
        layerId: string
    }
}

export interface ISetViewportAction {
    type: "SET_VIEWPORT"
    payload: {
        width: number
        height: number
    }
}

export interface ISetCommandLinePosition {
    type: "SET_COMMAND_LINE_POSITION"
    payload: {
        position: number
        level: number
    }
}

export interface IHideCommandLineAction {
    type: "HIDE_COMMAND_LINE"
}

export interface IShowCommandLineAction {
    type: "SHOW_COMMAND_LINE"
    payload: {
        content: Array<[any, string]>
        position: number
        firstchar: string
        prompt: string
        indent: number
        level: number
    }
}

export interface IWildMenuSelectedAction {
    type: "WILDMENU_SELECTED"
    payload: {
        selected: number
    }
}

export interface IShowWildMenuAction {
    type: "SHOW_WILDMENU"
    payload: {
        options: string[]
    }
}

export interface IHideWildMenuAction {
    type: "HIDE_WILDMENU"
}

export interface ISetNeovimErrorAction {
    type: "SET_NEOVIM_ERROR"
    payload: {
        neovimError: boolean
    }
}

export interface ISetCursorScaleAction {
    type: "SET_CURSOR_SCALE"
    payload: {
        cursorScale: number
    }
}

export interface ISetCurrentBuffersAction {
    type: "SET_CURRENT_BUFFERS"
    payload: {
        bufferIds: number[]
    }
}

export interface ISetImeActive {
    type: "SET_IME_ACTIVE"
    payload: {
        imeActive: boolean
    }
}

export interface ISetFont {
    type: "SET_FONT"
    payload: {
        fontFamily: string
        fontSize: string
        fontWeight: string
    }
}

export interface IBufferEnterAction {
    type: "BUFFER_ENTER"
    payload: {
        buffers: State.IBuffer[]
    }
}

export interface IShowToolTipAction {
    type: "SHOW_TOOL_TIP"
    payload: {
        id: string
        element: JSX.Element
        options?: Oni.ToolTip.ToolTipOptions
    }
}

export interface IHideToolTipAction {
    type: "HIDE_TOOL_TIP"
    payload: {
        id: string
    }
}

export interface IBufferUpdateAction {
    type: "BUFFER_UPDATE"
    payload: {
        id: number
        modified: boolean
        version: number
        totalLines: number
    }
}

export interface IBufferSaveAction {
    type: "BUFFER_SAVE"
    payload: {
        id: number
        modified: boolean
        version: number
    }
}

export interface ISetTabs {
    type: "SET_TABS"
    payload: {
        selectedTabId: number
        tabs: State.ITab[]
    }
}

export interface ISetActiveVimTabPage {
    type: "SET_ACTIVE_VIM_TAB_PAGE"
    payload: {
        id: number
        windowIds: number[]
    }
}

export interface ISetWindowCursor {
    type: "SET_WINDOW_CURSOR"
    payload: {
        windowId: number
        line: number
        column: number
    }
}

export interface ISetWindowState {
    type: "SET_WINDOW_STATE"
    payload: {
        windowId: number
        bufferId: number
        file: string
        column: number
        line: number

        dimensions: Oni.Shapes.Rectangle

        bufferToScreen: Oni.Coordinates.BufferToScreen
        screenToPixel: Oni.Coordinates.ScreenToPixel
        bufferToPixel: Oni.Coordinates.BufferToPixel

        topBufferLine: number
        bottomBufferLine: number
        visibleLines: string[]
    }
}

export interface ISetInactiveWindowState {
    type: "SET_INACTIVE_WINDOW_STATE"
    payload: {
        windowId: number
        dimensions: Oni.Shapes.Rectangle
    }
}

export interface ISetErrorsAction {
    type: "SET_ERRORS"
    payload: {
        errors: Errors
    }
}

export interface ISetCursorPositionAction {
    type: "SET_CURSOR_POSITION"
    payload: {
        pixelX: number
        pixelY: number
        fontPixelWidth: number
        fontPixelHeight: number
        cursorCharacter: string
        cursorPixelWidth: number
    }
}

export interface ISetModeAction {
    type: "SET_MODE"
    payload: {
        mode: string
    }
}

export interface IShowDefinitionAction {
    type: "SHOW_DEFINITION"
    payload: {
        token: Oni.IToken
        definitionLocation: types.Location
    }
}

export interface IHideDefinitionAction {
    type: "HIDE_DEFINITION"
}

export interface ISetConfigurationValue<K extends keyof IConfigurationValues> {
    type: "SET_CONFIGURATION_VALUE"
    payload: {
        key: K
        value: IConfigurationValues[K]
    }
}

export type Action<K extends keyof IConfigurationValues> = SimpleAction | ActionWithGeneric<K>

export type SimpleAction =
    | IAddBufferLayerAction
    | IRemoveBufferLayerAction
    | IUpdateBufferDecorationsAction
    | IClearBufferDecorationsAction
    | IBufferEnterAction
    | IBufferSaveAction
    | IBufferUpdateAction
    | ISetColorsAction
    | ISetCursorPositionAction
    | ISetImeActive
    | ISetFont
    | IHideToolTipAction
    | IShowToolTipAction
    | IHideDefinitionAction
    | IShowDefinitionAction
    | ISetModeAction
    | ISetCursorScaleAction
    | ISetErrorsAction
    | ISetCurrentBuffersAction
    | ISetHasFocusAction
    | ISetNeovimErrorAction
    | ISetTabs
    | ISetActiveVimTabPage
    | ISetLoadingCompleteAction
    | ISetViewportAction
    | ISetWindowCursor
    | ISetWindowState
    | ISetInactiveWindowState
    | IShowCommandLineAction
    | IHideCommandLineAction
    | ISetCommandLinePosition
    | IHideWildMenuAction
    | IShowWildMenuAction
    | IWildMenuSelectedAction

export type ActionWithGeneric<K extends keyof IConfigurationValues> = ISetConfigurationValue<K>

export const setHasFocus = (hasFocus: boolean) => {
    return {
        type: "SET_HAS_FOCUS",
        payload: {
            hasFocus,
        },
    }
}

export const setLoadingComplete = () => {
    return {
        type: "SET_LOADING_COMPLETE",
    }
}

export const setColors = (colors: IThemeColors) => ({
    type: "SET_COLORS",
    payload: {
        colors,
    },
})

export const setCommandLinePosition = ({
    pos: position,
    level,
}: {
    pos: number
    level: number
}) => ({
    type: "SET_COMMAND_LINE_POSITION",
    payload: {
        position,
        level,
    },
})

export const hideCommandLine = () => ({
    type: "HIDE_COMMAND_LINE",
})

export const showCommandLine = (
    content: Array<[any, string]>,
    pos: number,
    firstchar: string,
    prompt: string,
    indent: number,
    level: number,
) => ({
    type: "SHOW_COMMAND_LINE",
    payload: {
        content,
        position: pos,
        firstchar,
        prompt,
        indent,
        level,
    },
})

export const showWildMenu = (payload: { options: string[] }) => ({
    type: "SHOW_WILDMENU",
    payload,
})

export const wildMenuSelect = (payload: { selected: number }) => ({
    type: "WILDMENU_SELECTED",
    payload,
})

export const hideWildMenu = () => ({
    type: "HIDE_WILDMENU",
})

export const setNeovimError = (neovimError: boolean) => ({
    type: "SET_NEOVIM_ERROR",
    payload: {
        neovimError,
    },
})

export const setViewport = (width: number, height: number) => ({
    type: "SET_VIEWPORT",
    payload: {
        width,
        height,
    },
})

export const setCursorScale = (cursorScale: number) => ({
    type: "SET_CURSOR_SCALE",
    payload: {
        cursorScale,
    },
})

const formatBuffers = (buffer: InactiveBufferContext & EventContext) => {
    return {
        id: buffer.bufferNumber,
        file: buffer.bufferFullPath ? normalizePath(buffer.bufferFullPath) : "",
        totalLines: buffer.bufferTotalLines ? buffer.bufferTotalLines : null,
        language: buffer.filetype,
        hidden: buffer.hidden,
        listed: buffer.listed,
        modified: buffer.modified,
    }
}

export const addBufferLayer = (
    bufferId: number,
    layer: Oni.BufferLayer,
): IAddBufferLayerAction => ({
    type: "ADD_BUFFER_LAYER",
    payload: {
        bufferId,
        layer,
    },
})

export const removeBufferLayer = (
    bufferId: number,
    layer: Oni.BufferLayer,
): IRemoveBufferLayerAction => ({
    type: "REMOVE_BUFFER_LAYER",
    payload: {
        bufferId,
        layer,
    },
})

export const updateBufferDecorations = (
    decorations: State.IDecoration[],
    layerId: string,
): IUpdateBufferDecorationsAction => ({
    type: "UPDATE_DECORATIONS",
    payload: { decorations, layerId },
})

export const clearBufferDecorations = (layerId: string): IClearBufferDecorationsAction => ({
    type: "CLEAR_DECORATIONS",
    payload: { layerId },
})

export const bufferEnter = (buffers: Array<InactiveBufferContext | EventContext>) => ({
    type: "BUFFER_ENTER",
    payload: {
        buffers: buffers.map(formatBuffers),
    },
})

export const bufferUpdate = (id: number, modified: boolean, totalLines: number) => ({
    type: "BUFFER_UPDATE",
    payload: {
        id,
        modified,
        totalLines,
    },
})

export const bufferSave = (id: number, modified: boolean, version: number) => ({
    type: "BUFFER_SAVE",
    payload: {
        id,
        modified,
        version,
    },
})

export const setCurrentBuffers = (bufferIds: number[]) => ({
    type: "SET_CURRENT_BUFFERS",
    payload: {
        bufferIds,
    },
})

export const setImeActive = (imeActive: boolean) => ({
    type: "SET_IME_ACTIVE",
    payload: {
        imeActive,
    },
})

export const setFont = (fontFamily: string, fontSize: string, fontWeight: string) => ({
    type: "SET_FONT",
    payload: {
        fontFamily,
        fontSize,
        fontWeight,
    },
})

export const setTabs = (selectedTabId: number, tabs: State.ITab[]): ISetTabs => ({
    type: "SET_TABS",
    payload: {
        selectedTabId,
        tabs,
    },
})

export const setWindowCursor = (windowId: number, line: number, column: number) => ({
    type: "SET_WINDOW_CURSOR",
    payload: {
        windowId,
        line,
        column,
    },
})

export const setWindowState = (
    windowId: number,
    bufferId: number,
    file: string,
    column: number,
    line: number,
    bottomBufferLine: number,
    topBufferLine: number,
    dimensions: Oni.Shapes.Rectangle,
    bufferToScreen: Oni.Coordinates.BufferToScreen,
    visibleLines: string[],
) => (dispatch: DispatchFunction, getState: GetStateFunction) => {
    const { fontPixelWidth, fontPixelHeight } = getState()

    const screenToPixel = (screenSpace: Oni.Coordinates.ScreenSpacePoint) => {
        if (
            !screenSpace ||
            typeof screenSpace.screenX !== "number" ||
            typeof screenSpace.screenY !== "number"
        ) {
            return {
                pixelX: NaN,
                pixelY: NaN,
            }
        }

        return {
            pixelX: screenSpace.screenX * fontPixelWidth,
            pixelY: screenSpace.screenY * fontPixelHeight,
        }
    }

    const bufferToPixel = (position: types.Position): Oni.Coordinates.PixelSpacePoint => {
        const screenPosition = bufferToScreen(position)

        if (!screenPosition) {
            return null
        }

        return screenToPixel(screenPosition)
    }

    dispatch({
        type: "SET_WINDOW_STATE",
        payload: {
            windowId,
            bufferId,
            file: normalizePath(file),
            column,
            dimensions,
            line,
            bufferToScreen,
            screenToPixel,
            bufferToPixel,
            bottomBufferLine,
            topBufferLine,
            visibleLines,
        },
    })
}

export const setInactiveWindowState = (
    windowId: number,
    dimensions: Oni.Shapes.Rectangle,
): ISetInactiveWindowState => ({
    type: "SET_INACTIVE_WINDOW_STATE",
    payload: {
        windowId,
        dimensions,
    },
})

export const showToolTip = (
    id: string,
    element: JSX.Element,
    options?: Oni.ToolTip.ToolTipOptions,
) => ({
    type: "SHOW_TOOL_TIP",
    payload: {
        id,
        element,
        options,
    },
})

export const hideToolTip = (id: string) => ({
    type: "HIDE_TOOL_TIP",
    payload: {
        id,
    },
})

export const setErrors = (errors: Errors) => ({
    type: "SET_ERRORS",
    payload: {
        errors,
    },
})

export const setCursorPosition = (screen: IScreen) => (dispatch: DispatchFunction) => {
    const cell = screen.getCell(screen.cursorColumn, screen.cursorRow)

    dispatch(
        _setCursorPosition(
            screen.cursorColumn * screen.fontWidthInPixels,
            screen.cursorRow * screen.fontHeightInPixels,
            screen.fontWidthInPixels,
            screen.fontHeightInPixels,
            cell.character,
            cell.characterWidth * screen.fontWidthInPixels,
        ),
    )
}

export const setMode = (mode: string) => ({
    type: "SET_MODE",
    payload: { mode },
})

export const setDefinition = (
    token: Oni.IToken,
    definitionLocation: types.Location,
): IShowDefinitionAction => ({
    type: "SHOW_DEFINITION",
    payload: {
        token,
        definitionLocation,
    },
})

export const hideDefinition = () => ({
    type: "HIDE_DEFINITION",
})

export const setCursorLineOpacity = (opacity: number) => ({
    type: "SET_CURSOR_LINE_OPACITY",
    payload: {
        opacity,
    },
})

export const setCursorColumnOpacity = (opacity: number) => ({
    type: "SET_CURSOR_COLUMN_OPACITY",
    payload: {
        opacity,
    },
})

export const setActiveVimTabPage = (tabId: number, windowIds: number[]): ISetActiveVimTabPage => ({
    type: "SET_ACTIVE_VIM_TAB_PAGE",
    payload: {
        id: tabId,
        windowIds,
    },
})

export function setConfigValue<K extends keyof IConfigurationValues>(
    k: K,
    v: IConfigurationValues[K],
): ISetConfigurationValue<K> {
    return {
        type: "SET_CONFIGURATION_VALUE",
        payload: {
            key: k,
            value: v,
        },
    }
}

const _setCursorPosition = (
    cursorPixelX: any,
    cursorPixelY: any,
    fontPixelWidth: any,
    fontPixelHeight: any,
    cursorCharacter: string,
    cursorPixelWidth: number,
) => ({
    type: "SET_CURSOR_POSITION",
    payload: {
        pixelX: cursorPixelX,
        pixelY: cursorPixelY,
        fontPixelWidth,
        fontPixelHeight,
        cursorCharacter,
        cursorPixelWidth,
    },
})
