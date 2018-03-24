/**
 * TutorialManager
 */

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import { InitializeBufferStage, MoveToGoalStage } from "./../Stages"

export class BasicMovementTutorial implements ITutorial {
    private _positions: number[] = []
    private _stages: ITutorialStage[]

    constructor() {
        const randomPosition = () => Math.round(Math.random() * 8)
        this._positions = [
            randomPosition(),
            randomPosition(),
            randomPosition(),
            randomPosition(),
            randomPosition(),
            randomPosition(),
        ]

        this._stages = [
            new InitializeBufferStage(),
            new MoveToGoalStage("Use 'l' to move RIGHT to the goal", 0, 8),
            new MoveToGoalStage("Use 'j' to move DOWN to the goal", 8, 8),
            new MoveToGoalStage("Use 'h' to move LEFT to the goal", 8, 1),
            new MoveToGoalStage("Use 'k' to move UP to the goal", 1, 1),
            new MoveToGoalStage(
                "Put it together! Use h/j/k/l to move to the goal",
                this._positions[0],
                this._positions[1],
            ),
            new MoveToGoalStage(
                "Do it again! Use h/j/k/l to move to the goal",
                this._positions[2],
                this._positions[3],
            ),
            new MoveToGoalStage(
                "One last time... Use h/j/k/l to move to the goal",
                this._positions[4],
                this._positions[5],
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.basic_movement",
            name: "Normal Mode Motion: h/j/k/l",
            description:
                "To use Oni effectively in normal mode, you'll need to learn to move the cursor around! There are many ways to move the cursor, but the most basic is to use `h`, `j`, `k`, and `l`. These keys might seem strange at first, but they allow you to move the cursor without your fingers leaving the home row.",
            level: 110,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }
}
