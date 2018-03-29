/**
 * TutorialManager
 */

import { ITutorial } from "./../ITutorial"

import { BasicMovementTutorial } from "./BasicMovementTutorial"
import { BeginningsAndEndingsTutorial } from "./BeginningsAndEndingsTutorial"
import { DeleteCharacterTutorial } from "./DeleteCharacterTutorial"
import { MoveAndInsertTutorial } from "./MoveAndInsertTutorial"
import { SwitchModeTutorial } from "./SwitchModeTutorial"
import { VerticalMovementTutorial } from "./VerticalMovementTutorial"

export * from "./DeleteCharacterTutorial"
export * from "./SwitchModeTutorial"

export const AllTutorials: ITutorial[] = [
    new SwitchModeTutorial(),
    new BasicMovementTutorial(),
    new BeginningsAndEndingsTutorial(),
    new DeleteCharacterTutorial(),
    new MoveAndInsertTutorial(),
    new VerticalMovementTutorial(),
]
