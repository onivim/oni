/**
 * GameplayBufferLayer.tsx
 *
 * The gameplay buffer layer is a buffer layer applied on the
 * _nested_ NeovimEditor - so this actually renders the 'game'
 * UI - any additional adorners that are necessary.
 */

import * as React from "react"

import * as Oni from "oni-api"

import { TutorialGameplayManager } from "./TutorialGameplayManager"

export class GameplayBufferLayer implements Oni.BufferLayer {
    public get id(): string {
        return "oni.layer.gameplay"
    }

    public get friendlyName(): string {
        return "Gameplay"
    }

    constructor(private _tutorialGameplayManager: TutorialGameplayManager) {}

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return (
            <GameplayBufferLayerView
                context={context}
                tutorialGameplay={this._tutorialGameplayManager}
            />
        )
    }
}

export interface IGameplayBufferLayerViewProps {
    tutorialGameplay: TutorialGameplayManager
    context: Oni.BufferLayerRenderContext
}

export interface IGameplayBufferLayerViewState {
    renderFunction: (context: Oni.BufferLayerRenderContext) => JSX.Element
    tick: number
}

export class GameplayBufferLayerView extends React.PureComponent<
    IGameplayBufferLayerViewProps,
    IGameplayBufferLayerViewState
> {
    constructor(props: IGameplayBufferLayerViewProps) {
        super(props)

        this.state = {
            renderFunction: () => null,
            tick: 0,
        }
    }

    public componentDidMount(): void {
        this.props.tutorialGameplay.onStateChanged.subscribe(newState => {
            this.setState({
                renderFunction: newState.renderFunc,
            })
        })

        this.props.tutorialGameplay.onTick.subscribe(() => {
            this.forceUpdate()
        })
    }

    public render(): JSX.Element {
        if (this.state.renderFunction) {
            return this.state.renderFunction(this.props.context)
        }

        return null
    }
}
