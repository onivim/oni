/**
 * TutorialBufferLayer.tsx
 */

import * as React from "react"

import * as Oni from "oni-api"

import { ITutorialState, TutorialStateManager } from "./TutorialManager"

export class TutorialBufferLayer implements Oni.EditorLayer {
    public get id(): string {
        return "oni.tutorial"
    }

    public get friendlyName(): string {
        return "Tutorial"
    }

    constructor(private _buffer: Oni.Buffer, private _tutorialStateManager: TutorialStateManager) {
        console.log(this._buffer)
    }

    public render(context: Oni.EditorLayerRenderContext): JSX.Element {
        return (
            <TutorialBufferLayerView
                renderContext={context}
                tutorialManager={this._tutorialStateManager}
            />
        )
    }
}

export interface ITutorialBufferLayerViewProps {
    renderContext: Oni.EditorLayerRenderContext
    tutorialManager: TutorialStateManager
}

export interface ITutorialBufferLayerState {
    tutorialState: ITutorialState
}

export class TutorialBufferLayerView extends React.PureComponent<
    ITutorialBufferLayerViewProps,
    ITutorialBufferLayerState
> {
    constructor(props: ITutorialBufferLayerViewProps) {
        super(props)

        this.state = {
            tutorialState: null,
        }
    }

    public componentDidMount(): void {
        this.props.tutorialManager.onStateChanged.subscribe(newState => {
            this.setState({ tutorialState: newState })
        })
    }

    public render(): JSX.Element {
        return <div>{JSON.stringify(this.state.tutorialState)}</div>
    }
}
