export interface IWidgetRenderContext {
    selectedId: string
}

export interface ISidebarWidget {
    ids: string[]

    render(context: IWidgetRenderContext): JSX.Element
}

export interface ISidebarPaneState {
    selectedId: string
    widgets: ISidebarWidget[]
}

export type SidebarPaneActions = {
    type: "SET_WIDGETS",
    widgets: ISidebarWidget[],
} | {
    type: "SET_SELECTED_ID",
    selectedId: string,
}

export const DefaultSidebarPaneState: ISidebarPaneState = {
    widgets: [],
    selectedId: null,
}

export const reducer = (
    state: ISidebarPaneState = DefaultSidebarPaneState,
    action: SidebarPaneActions,
) => {
    switch (action.type) {
        case "SET_WIDGETS":
            return {
                ...state,
                widgets: action.widgets,
            }
        case "SET_SELECTED_ID":
            return {
                ...state,
                selectedId: action.selectedId,
            }
        default:
            return state
    }
}
