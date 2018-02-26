/**
 * SnippetBufferLayer.tsx
 *
 * UX for the Snippet functionality, implemented as a buffer layer
 */

import * as React from "React"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { SnippetSession } from "./SnippetSession"

export class SnippetBufferLayer implements Oni.EditorLayer {
    constructor(private _snippetSession: SnippetSession) {}
    public get id(): string {
        return "oni.layers.snippet"
    }

    public get friendlyName(): string {
        return "Snippet"
    }

    public render(context: Oni.EditorLayerRenderContext): JSX.Element {
        return <SnippetBufferLayerView context={context} snippetSession={this._snippetSession} />
    }
}

export interface ISnippetBufferLayerViewProps {
    context: Oni.EditorLayerRenderContext
    snippetSession: SnippetSession
}

export class SnippetBufferLayerView extends React.PureComponent<ISnippetBufferLayerViewProps, {}> {
    public render(): JSX.Element {
        return <div>Hello World!</div>
    }
}
