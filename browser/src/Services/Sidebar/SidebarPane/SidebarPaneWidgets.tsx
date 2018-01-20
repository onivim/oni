import * as React from "react"

import styled from "styled-components"

import { ISidebarWidget, IWidgetRenderContext } from "./SidebarPaneStore"

/**
 * Widgets
 */

export class LabelWidget implements ISidebarWidget {
    public get ids(): string[] {
        return []
    }

    public render(context: IWidgetRenderContext): JSX.Element {
        return <div>test</div>
    }
}

export type ItemWidgetRenderFunction = (widgetRenderContext: IWidgetRenderContext) => JSX.Element

export class ItemWidget implements ISidebarWidget {

    public get ids(): string[] {
        return [this._id]
    }
    private _renderer: ItemWidgetRenderFunction

    constructor(
        private _id: string,
        // private _renderer: ItemWidgetRenderFunction = (context) => <div style={{fontWeight: context.selectedId === this._id ? "bold" : null}}>Test2</div>
    ) {
           this._renderer = (context) => <div style={{fontWeight: context.selectedId === this._id ? "bold" : null}}>Test2</div>
    }

    public render(widgetRenderContext: IWidgetRenderContext): JSX.Element {
        return this._renderer(widgetRenderContext)
    }
}

export const ContainerWidgetWrapper = styled.div`
    background-color: #1e2127;
    border-left: 4px solid rgb(97, 175, 239);

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 4px;
`

export class ContainerWidget implements ISidebarWidget {

    public get ids(): string[] {
        return []
    }

    public render(context: IWidgetRenderContext): JSX.Element {
        const expanded = false
        const caretStyle = {
            transform: expanded ? "rotateZ(45deg)" : "rotateZ(0deg)",
        }
        return <ContainerWidgetWrapper>
            <div className="icon">
                <i style={caretStyle} className="fa fa-caret-right" />
            </div>
            <div className="name">
                {"test"}
            </div>
        </ContainerWidgetWrapper>
    }

}
