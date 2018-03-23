/**
 * TutorialManager
 */

import { ITutorial } from "./../ITutorial"

import { SwitchModeTutorial } from "./SwitchModeTutorial"
import { BasicMovementTutorial } from "./BasicMovementTutorial"

export * from "./BasicMovementTutorial"
export * from "./SwitchModeTutorial"

export const AllTutorials: ITutorial[] = [new SwitchModeTutorial(), new BasicMovementTutorial()]
