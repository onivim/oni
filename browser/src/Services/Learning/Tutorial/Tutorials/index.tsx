/**
 * TutorialManager
 */

import { ITutorial } from "./../ITutorial"

import { BasicMovementTutorial } from "./BasicMovementTutorial"
import { DeleteCharacterTutorial } from "./DeleteCharacterTutorial"
import { MoveAndInsertTutorial } from "./MoveAndInsertTutorial"
import { SwitchModeTutorial } from "./SwitchModeTutorial"

export * from "./DeleteCharacterTutorial"
export * from "./SwitchModeTutorial"

export const AllTutorials: ITutorial[] = [
    new SwitchModeTutorial(),
    new BasicMovementTutorial(),
    new DeleteCharacterTutorial(),
    new MoveAndInsertTutorial(),
]
