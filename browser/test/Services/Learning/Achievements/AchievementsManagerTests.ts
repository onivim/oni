/**
 * AchievementsManagerTests.ts
 */

import * as assert from "assert"

import {
    AchievementsManager,
    AchievementDefinition,
    IPersistedAchievementState,
} from "./../../../../src/Services/Learning/Achievements"

import { MockPersistentStore } from "./../../../Mocks"

const createTestAchievement = (uniqueId: string, goalId: string) => ({
    uniqueId,
    name: "some test achievement",
    description: "some test achievement description",
    goals: [
        {
            name: "some test name",
            goalId,
            count: 1,
        },
    ],
})

describe("AchievementsManagerTests", () => {
    let mockStore: MockPersistentStore<IPersistedAchievementState>

    beforeEach(() => {
        mockStore = new MockPersistentStore<IPersistedAchievementState>({
            goalCounts: {},
            achievedIds: [],
        })
    })

    it("fires onAchievementAccomplished when an achievement is accomplished", async () => {
        const achievementsManager = new AchievementsManager(mockStore)
        await achievementsManager.start()

        let hitCount = 0
        achievementsManager.onAchievementAccomplished.subscribe(() => {
            hitCount++
        })

        const achievement = createTestAchievement("test.achievement", "test.goal")
        achievementsManager.registerAchievement(achievement)

        achievementsManager.notifyGoal("test.goal")
        assert.strictEqual(hitCount, 1, "Validate that onAchievementsAccomplished was fired")
    })

    it("doesn't fire onAchievementAccomplished if an achievement was already accomplished prior to tracking", async () => {
        await mockStore.set({
            goalCounts: {},
            achievedIds: ["test.achievement"],
        })

        const achievementsManager = new AchievementsManager(mockStore)
        await achievementsManager.start()

        let hitCount = 0
        achievementsManager.onAchievementAccomplished.subscribe(() => {
            hitCount++
        })

        const achievement = createTestAchievement("test.achievement", "test.goal")

        // Notify goal BEFORE the achievement is registered
        achievementsManager.notifyGoal("test.goal")

        achievementsManager.registerAchievement(achievement)

        assert.strictEqual(hitCount, 0, "Validate that onAchievementsAccomplished was not fired")
    })

    it("does fire onAchievementAccomplished if goals are met, but it hasn't been accomplished yet", async () => {
        const achievementsManager = new AchievementsManager(mockStore)
        await achievementsManager.start()

        let hitCount = 0
        achievementsManager.onAchievementAccomplished.subscribe(() => {
            hitCount++
        })

        achievementsManager.notifyGoal("test.goal")

        const achievement = createTestAchievement("test.achievement", "test.goal")
        achievementsManager.registerAchievement(achievement)

        assert.strictEqual(hitCount, 1, "Validate that onAchievementsAccomplished was fired")
    })

    describe("dependent achievements", () => {
        let achievementsManager: AchievementsManager
        let coreAchievement: AchievementDefinition
        let dependentAchievement: AchievementDefinition

        beforeEach(async () => {
            achievementsManager = new AchievementsManager(mockStore)
            await achievementsManager.start()

            coreAchievement = createTestAchievement("test.achievement.core", "test.goal")
            dependentAchievement = createTestAchievement("test.achievement.dependent", "test.goal")
            dependentAchievement.dependsOnId = "test.achievement.core"

            achievementsManager.registerAchievement(coreAchievement)
            achievementsManager.registerAchievement(dependentAchievement)
        })

        it("is locked until dependent achievement is accomplished", () => {
            const progress = achievementsManager.getAchievements()

            const coreResult = progress.find(
                a => a.achievement.uniqueId === "test.achievement.core",
            )
            const dependentResult = progress.find(
                a => a.achievement.uniqueId === "test.achievement.dependent",
            )

            assert.strictEqual(coreResult.locked, false)
            assert.strictEqual(dependentResult.locked, true)

            achievementsManager.notifyGoal("test.goal")

            const progressAfterFirstGoal = achievementsManager.getAchievements()
            const coreResultAfter = progressAfterFirstGoal.find(
                a => a.achievement.uniqueId === "test.achievement.core",
            )
            const dependentResultAfter = progressAfterFirstGoal.find(
                a => a.achievement.uniqueId === "test.achievement.dependent",
            )

            assert.strictEqual(coreResultAfter.completed, true)
            // The dependent result should no longer be locked
            assert.strictEqual(dependentResultAfter.locked, false)
        })
    })
})
