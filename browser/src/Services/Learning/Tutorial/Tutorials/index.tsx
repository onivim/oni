/**
 * TutorialManager
 */

import { ITutorial } from "./../ITutorial"

import { BasicMovementTutorial } from "./BasicMovementTutorial"
import { SwitchModeTutorial } from "./SwitchModeTutorial"

export * from "./BasicMovementTutorial"
export * from "./SwitchModeTutorial"

export const AllTutorials: ITutorial[] = [new SwitchModeTutorial(), new BasicMovementTutorial()]
