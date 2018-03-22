/**
 * TutorialManagerTests.ts
 */

import * as assert from "assert"

import { EditorManager } from "./../../../../src/Services/EditorManager"
import {
    IPersistedTutorialState,
    ITutorial,
    TutorialManager,
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

    describe("registerTutorial", () => {
        it("adds a tutorial", async () => {
            const tutorialManager = new TutorialManager(editorManager, mockStore)

            const tutorial = createMockTutorial("test.tutorial.1", "test tutorial")
            tutorialManager.registerTutorial(tutorial)

            const tutorials = tutorialManager.getTutorialInfo()

            assert.strictEqual(tutorials.length, 1)
        })
    })

    describe("getTutorialInfo", () => {
        it("returns tutorials sorted by level", async () => {
            const tutorialManager = new TutorialManager(editorManager, mockStore)

            const tutorial1 = createMockTutorial("test.tutorial.1", "test tutorial1", 1)
            tutorialManager.registerTutorial(tutorial1)

            const tutorial0 = createMockTutorial("test.tutorial.0", "test tutorial0", 0)
            tutorialManager.registerTutorial(tutorial0)

            const tutorials = tutorialManager.getTutorialInfo()
            assert.strictEqual(tutorials.length, 2)

            // Validate the tutorials are sorted by their 'level'
            assert.strictEqual(tutorials[0].tutorialInfo.id, "test.tutorial.0")
            assert.strictEqual(tutorials[1].tutorialInfo.id, "test.tutorial.1")
        })
    })

    describe("getNextTutorialId", () => {
        it("gets next incomplete tutorial if null", async () => {
            const tutorialManager = new TutorialManager(editorManager, mockStore)
            await tutorialManager.start()

            const tutorial0 = createMockTutorial("test.tutorial.0", "test tutorial0", 0)
            tutorialManager.registerTutorial(tutorial0)

            const tutorial1 = createMockTutorial("test.tutorial.1", "test tutorial1", 1)
            tutorialManager.registerTutorial(tutorial1)

            const tutorial2 = createMockTutorial("test.tutorial.2", "test tutorial2", 2)
            tutorialManager.registerTutorial(tutorial2)

            await tutorialManager.notifyTutorialCompleted("test.tutorial.0", {
                keyPresses: 10,
                time: 1521,
            })

            await tutorialManager.notifyTutorialCompleted("test.tutorial.1", {
                keyPresses: 10,
                time: 1521,
            })

            const nextTutorial = tutorialManager.getNextTutorialId()
            assert.strictEqual(nextTutorial, "test.tutorial.2")
        })

        it("gets tutorial in sequence", async () => {
            const tutorialManager = new TutorialManager(editorManager, mockStore)
            await tutorialManager.start()

            const tutorial0 = createMockTutorial("test.tutorial.0", "test tutorial0", 0)
            tutorialManager.registerTutorial(tutorial0)

            const tutorial1 = createMockTutorial("test.tutorial.1", "test tutorial1", 1)
            tutorialManager.registerTutorial(tutorial1)

            const tutorial2 = createMockTutorial("test.tutorial.2", "test tutorial2", 2)
            tutorialManager.registerTutorial(tutorial2)

            const nextTutorial = tutorialManager.getNextTutorialId("test.tutorial.1")
            assert.strictEqual(nextTutorial, "test.tutorial.2")
        })
    })

    describe("notifyTutorialCompleted", () => {
        it("dispatches 'onTutorialCompletedEvent' when a tutorial is completed", async () => {
            const tutorialManager = new TutorialManager(editorManager, mockStore)
            await tutorialManager.start()

            const tutorial0 = createMockTutorial("test.tutorial.0", "test tutorial0", 0)
            tutorialManager.registerTutorial(tutorial0)

            let hitCount = 0
            tutorialManager.onTutorialCompletedEvent.subscribe(() => {
                hitCount++
            })

            await tutorialManager.notifyTutorialCompleted("test.tutorial.0", {
                keyPresses: 10,
                time: 1522,
            })

            assert.strictEqual(hitCount, 1, "Validate event was dispatched")
        })

        it("persists completion data to the store", async () => {
            const tutorialManager = new TutorialManager(editorManager, mockStore)
            await tutorialManager.start()

            const tutorial0 = createMockTutorial("test.tutorial.0", "test tutorial0", 0)
            tutorialManager.registerTutorial(tutorial0)

            await tutorialManager.notifyTutorialCompleted("test.tutorial.0", {
                keyPresses: 10,
                time: 1522,
            })

            const completionInfo = await mockStore.get()

            const expectedInfo = {
                completionInfo: {
                    "test.tutorial.0": {
                        keyPresses: 10,
                        time: 1522,
                    },
                },
            }

            assert.deepEqual(completionInfo, expectedInfo, "Validate info was persisted")
        })
    })
})
