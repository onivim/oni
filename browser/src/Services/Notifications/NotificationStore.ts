/**
 * NotificationStore.ts
 *
 * State management for Notifications
 */

import { Reducer, Store } from "redux"
import { createStore as createReduxStore } from "./../../Redux"

export type NotificationLevel = "info" | "warn" | "error"

export type IdToNotification = { [key: string]: INotification }

export interface INotificationsState {
    notifications: IdToNotification
}

export const DefaultNotificationState: INotificationsState = {
    notifications: {},
}

export interface INotification {
    id: string
    level: NotificationLevel
    title: string
    detail: string
}

export type NotificationAction = {
    type: "SHOW_NOTIFICATION",
    id: string,
    level: NotificationLevel,
    title: string,
    detail: string,
} | {
    type: "HIDE_NOTIFICATION",
    id: string,
}

export const notificationsReducer: Reducer<IdToNotification> = (
    state: IdToNotification = {},
    action: NotificationAction,
) => {
    switch (action.type) {
        case "SHOW_NOTIFICATION":
            return {
                ...state,
                [action.id]: {
                    id: action.id,
                    level: action.level,
                    title: action.title,
                    detail: action.detail,
                }
            }
        case "HIDE_NOTIFICATION":
            return {
                ...state,
                [action.id]: null,
            }
        default:
            return state
    }
}

export const stateReducer: Reducer<INotificationsState> = (
    state: INotificationsState = DefaultNotificationState,
    action: NotificationAction,
) => {
    return {
        notifications: notificationsReducer(state.notifications, action),
    }
}

export const createStore = (): Store<INotificationsState> => {
    return createReduxStore("Notifications", stateReducer, DefaultNotificationState)
}
