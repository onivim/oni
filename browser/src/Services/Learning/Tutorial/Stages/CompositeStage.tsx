/**
 * CompositeStage.tsx
 *
 * A stage that combines / composes multiple stages
 */

import * as Oni from "oni-api"
import * as React from "react"

import styled from "styled-components"

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

export const combine = (goalName: string, ...stages: ITutorialStage[]): ITutorialStage => {
    return new CompositeStage(goalName, stages)
}

const ContainerWrapper = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
`

export class CompositeStage implements ITutorialStage {
    public get goalName(): string {
        return this._goalName
    }

    constructor(private _goalName: string, private _stages: ITutorialStage[]) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const promises = this._stages.map(s => s.tickFunction(context))

        const results = await Promise.all(promises)

        return results.reduce((prev, curr) => {
            return prev && curr
        }, true)
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return <ContainerWrapper>{this._stages.map(s => s.render(context))}</ContainerWrapper>
    }
}
