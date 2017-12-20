/**
 * DefinitionSelectors
 */

import { IState } from "./../../Editor/NeovimEditor/NeovimEditorStore"

export const getActiveDefinition = (state: IState) => state.definition
