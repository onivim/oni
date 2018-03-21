/**
 * TutorialManagerTests.ts
 */

import * as assert from "assert"

import { EditorManager } from "./../../../../src/Services/EditorManager"
import {
    TutorialManager,
    IPersistedTutorialState,
    ITutorial,
} from "./../../../../src/Services/Learning/Tutorial"

import * as Mocks from "./../../../Mocks"

const createMockTutorial = (
    tutorialId: string,
    tutorialName: string,
    level: number = 100,
): ITutorial => {
    return {
        metadata: {
            id: tutorialId,
            name: tutorialName,
            description: "test description",
            level,
        },
        stages: [] as any[],
    }
}

describe("TutorialManagerTests", () => {
    let mockEditor: Mocks.MockEditor
    let mockStore: Mocks.MockPersistentStore<IPersistedTutorialState>
    let editorManager: EditorManager

    beforeEach(() => {
        mockEditor = new Mocks.MockEditor()
        mockStore = new Mocks.MockPersistentStore<IPersistedTutorialState>({
            completionInfo: {},
        })
        editorManager = new EditorManager()
        editorManager.setActiveEditor(mockEditor as any)
    })

    it("tests", async () => {
        const tutorialManager = new TutorialManager(editorManager, mockStore)

        const tutorial = createMockTutorial("test.tutorial.1", "test tutorial")
        tutorialManager.registerTutorial(tutorial)

        assert.ok(true)
    })
})
