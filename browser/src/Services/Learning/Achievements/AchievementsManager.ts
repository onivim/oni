/**
 * AchievementsManager.ts
 *
 * Primary API entry point for the achievements feature
 */

import { Event, IEvent } from "oni-types"

import * as Utility from "./../../../Utility"

import { IStore } from "./../../../Store"

export interface AchievementDefinition {
    uniqueId: string
    name: string
    description: string

    goals: AchievementGoalDefinition[]
}

export interface AchievementGoalDefinition {
    name: string
    goalId: string
    count: number
}

export class AchievementsManager {
    private _goalState: IPersistedAchievementState
    private _achievements: { [achievementId: string]: AchievementDefinition } = {}
    private _trackingGoals: { [goalId: string]: string[] } = {}

    private _currentIdleCallback: number | null = null
    private _onAchievementAccomplishedEvent = new Event<AchievementDefinition>()

    public get onAchievementAccomplished(): IEvent<AchievementDefinition> {
        return this._onAchievementAccomplishedEvent
    }

    constructor(private _persistentStore: IStore<IPersistedAchievementState>) {}

    public notifyGoal(goalId: string): void {
        if (!this._isInitialized()) {
            return
        }

        const currentGoal = this._goalState.goalCounts[goalId] || 0
        this._goalState.goalCounts[goalId] = currentGoal + 1

        // Look at all achievements associated with the goal, and check victory conditions
        const trackingGoals = this._trackingGoals[goalId] || []
        trackingGoals.forEach((achievementId: string) => {
            const achievement = this._achievements[achievementId]
            this._checkVictoryCondition(achievement)
        })

        this._schedulePersist()
    }

    public async start(): Promise<void> {
        this._goalState = await this._persistentStore.get()

        // Once we've loaded, we need to look at all our achievements,
        // and see if we should start tracking
        Object.values(this._achievements).forEach(achievement => {
            this._checkIfShouldTrackAchievement(achievement)
            this._checkVictoryCondition(achievement)
        })
    }

    public clearAchievements(): void {
        this._persistentStore.set({
            goalCounts: {},
            achievedIds: [],
        })
    }

    public registerAchievement(definition: AchievementDefinition): void {
        this._achievements[definition.uniqueId] = definition
        this._checkIfShouldTrackAchievement(definition)
        this._checkVictoryCondition(definition)
    }

    private _isInitialized(): boolean {
        return !!this._goalState
    }

    private _checkVictoryCondition(definition: AchievementDefinition): void {
        if (!this._isInitialized()) {
            return
        }

        // if (this._hasAchievementBeenAchieved(definition.uniqueId)) {
        //     return
        // }

        const areAllGoalsSatisfied = definition.goals.reduce((prev: boolean, goal) => {
            const hitCount = this._goalState.goalCounts[goal.goalId] || 0
            return prev && goal.count <= hitCount
        }, true)

        if (areAllGoalsSatisfied) {
            this._goalState.achievedIds.push(definition.uniqueId)
            this._onAchievementAccomplishedEvent.dispatch(definition)
        }
    }

    private _hasAchievementBeenAchieved(achievementId: string): boolean {
        return this._goalState.achievedIds.indexOf(achievementId) >= 0
    }

    private _checkIfShouldTrackAchievement(definition: AchievementDefinition): void {
        if (!this._isInitialized()) {
            return
        }

        if (this._hasAchievementBeenAchieved(definition.uniqueId)) {
            // Already been achieved!
            return
        }

        // Not achieved, so we'll track all the goalIds
        definition.goals.forEach(goal => {
            const currentTrackedItems = this._trackingGoals[goal.goalId] || []
            this._trackingGoals[goal.goalId] = [...currentTrackedItems, definition.uniqueId]
        })
    }

    private _schedulePersist(): void {
        if (this._currentIdleCallback !== null) {
            return
        }

        this._currentIdleCallback = Utility.requestIdleCallback(() => {
            this._persistentStore.set(this._goalState)
            this._currentIdleCallback = null
        })
    }
}

export interface GoalCounts {
    [goalId: string]: number
}

export interface IPersistedAchievementState {
    goalCounts: GoalCounts

    // Persisted ids of achievements that are already completed
    // - no need to bother tracking these.
    achievedIds: string[]
}
