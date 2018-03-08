/**
 * AchievementsManagerTests.ts
 */

import * as assert from "assert"

import {
    AchievementsManager,
    IAchievementsPersistentStore,
    IPersistedAchievementState,
} from "./../../../../src/Services/Learning/Achievements"

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

export class MockAchievementsPersistentStore implements IAchievementsPersistentStore {
    private _state: IPersistedAchievementState

    constructor() {
        this._state = {
            goalCounts: {},
            achievedIds: [],
        }
    }

    public async store(state: IPersistedAchievementState): Promise<void> {
        this._state = state
    }

    public async get(): Promise<IPersistedAchievementState> {
        return this._state
    }
}

describe("AchievementsManagerTests", () => {
    it("fires onAchievementAccomplished when an achievement is accomplished", async () => {
        const achievementsManager = new AchievementsManager(new MockAchievementsPersistentStore())
        await achievementsManager.start()

        let hitCount = 0
        achievementsManager.onAchievementAccomplished.subscribe(achievement => {
            hitCount++
        })

        const achievement = createTestAchievement("test.achievement", "test.goal")
        achievementsManager.registerAchievement(achievement)

        achievementsManager.notifyGoal("test.goal")
        assert.strictEqual(hitCount, 1, "Validate that onAchievementsAccomplished was fired")
    })

    it("doesn't fire onAchievementAccomplished if an achievement was already accomplished prior to tracking", async () => {
        const store = new MockAchievementsPersistentStore()
        await store.store({
            goalCounts: {},
            achievedIds: ["test.achievement"],
        })

        const achievementsManager = new AchievementsManager(store)
        await achievementsManager.start()

        let hitCount = 0
        achievementsManager.onAchievementAccomplished.subscribe(achievement => {
            hitCount++
        })

        const achievement = createTestAchievement("test.achievement", "test.goal")

        // Notify goal BEFORE the achievement is registered
        achievementsManager.notifyGoal("test.goal")

        achievementsManager.registerAchievement(achievement)

        assert.strictEqual(hitCount, 0, "Validate that onAchievementsAccomplished was not fired")
    })

    it("does fire onAchievementAccomplished if goals are met, but it hasn't been accomplished yet", async () => {
        const achievementsManager = new AchievementsManager(new MockAchievementsPersistentStore())
        await achievementsManager.start()

        let hitCount = 0
        achievementsManager.onAchievementAccomplished.subscribe(achievement => {
            hitCount++
        })

        achievementsManager.notifyGoal("test.goal")

        const achievement = createTestAchievement("test.achievement", "test.goal")
        achievementsManager.registerAchievement(achievement)

        assert.strictEqual(hitCount, 1, "Validate that onAchievementsAccomplished was fired")
    })
})
