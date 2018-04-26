/**
 * TutorialGameplayManagerTests.ts
 */

import * as assert from "assert"

import * as Oni from "oni-api"

import { MockEditor } from "./../../../Mocks"
import * as TestHelpers from "./../../../TestHelpers"

import {
    TutorialGameplayManager,
    TICK_RATE,
} from "./../../../../src/Services/Learning/Tutorial/TutorialGameplayManager"
import { ITutorialMetadata } from "./../../../../src/Services/Learning/Tutorial"

const MockTutorialMetadata: ITutorialMetadata = {
    id: "tutorial.test",
    name: "test tutorial",
    description: "tutorial for unit tests",
    level: -1,
}

// Helper to execute a 'tick', so that the 'setInterval' that runs the ticks
// gets picked up
const tick = async () => {
    await TestHelpers.waitForPromiseResolution()
    TestHelpers.tick(TICK_RATE + 1)
}

describe("TutorialGameplayManagerTests", () => {
    let mockEditor: Oni.Editor = null
    let tutorialGameplayManager: TutorialGameplayManager = null

    beforeEach(() => {
        mockEditor = new MockEditor()
        tutorialGameplayManager = new TutorialGameplayManager(mockEditor)
    })

    it("calls tick periodically while active", async () => {
        let hitCount = 0

        const tickFunction = () => {
            hitCount++
            return Promise.resolve(false)
        }

        const myTutorial = {
            metadata: MockTutorialMetadata,
            stages: [
                {
                    tickFunction: tickFunction,
                },
            ],
        }

        tutorialGameplayManager.start(myTutorial, mockEditor.activeBuffer)

        // Validate the tick function was executed
        assert.strictEqual(hitCount, 1)

        // Validate that another 'tick' was executed
        await tick()
        assert.strictEqual(hitCount, 2)

        tutorialGameplayManager.stop()

        // Validate that there wasn't another tick after stopping
        await tick()
        assert.strictEqual(hitCount, 2)
    })
})
