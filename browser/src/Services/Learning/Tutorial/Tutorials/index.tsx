/**
 * TutorialManager
 */

import { ITutorial } from "./../ITutorial"

import { BasicMovementTutorial } from "./BasicMovementTutorial"
import { BeginningsAndEndingsTutorial } from "./BeginningsAndEndingsTutorial"
import { ChangeOperatorTutorial } from "./ChangeOperatorTutorial"
import { CopyPasteTutorial } from "./CopyPasteTutorial"
import { DeleteCharacterTutorial } from "./DeleteCharacterTutorial"
import { DeleteOperatorTutorial } from "./DeleteOperatorTutorial"
import { MoveAndInsertTutorial } from "./MoveAndInsertTutorial"
import { SearchInBufferTutorial } from "./SearchInBufferTutorial"
import { SwitchModeTutorial } from "./SwitchModeTutorial"
import { TargetsVimPluginTutorial } from "./TargetsVimPluginTutorial"
import { VerticalMovementTutorial } from "./VerticalMovementTutorial"
import { VisualModeTutorial } from "./VisualModeTutorial"
import { WordMotionTutorial } from "./WordMotionTutorial"

export * from "./DeleteCharacterTutorial"
export * from "./SwitchModeTutorial"

export const AllTutorials: ITutorial[] = [
    new BeginningsAndEndingsTutorial(),
    new SwitchModeTutorial(),
    new BasicMovementTutorial(),
    new DeleteCharacterTutorial(),
    new DeleteOperatorTutorial(),
    new MoveAndInsertTutorial(),
    new VerticalMovementTutorial(),
    new WordMotionTutorial(),
    new SearchInBufferTutorial(),
    new CopyPasteTutorial(),
    new ChangeOperatorTutorial(),
    new VisualModeTutorial(),
    new TargetsVimPluginTutorial(),
]
