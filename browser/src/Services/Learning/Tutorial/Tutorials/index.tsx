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
import { WordMotionTutorial } from "./WordMotionTutorial"

export * from "./DeleteCharacterTutorial"
export * from "./SwitchModeTutorial"

export const AllTutorials: ITutorial[] = [
    new BeginningsAndEndingsTutorial(),
    new SwitchModeTutorial(),
    new BasicMovementTutorial(),
    new DeleteCharacterTutorial(),
    new MoveAndInsertTutorial(),
    new VerticalMovementTutorial(),
    new WordMotionTutorial(),
]
