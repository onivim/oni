/**
 * NotificationStore.ts
 *
 * State management for Notifications
 */

import { Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"
import { createStore as createReduxStore } from "./../../Redux"

export type NotificationLevel = "info" | "warn" | "error"

export interface IdToNotification {
    [key: string]: INotification
}

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
    expirationTime: number
    onClick: () => void
    onClose: () => void
}

interface IShowNotification {
    type: "SHOW_NOTIFICATION"
    id: string
    level: NotificationLevel
    title: string
    detail: string
    expirationTime: number
    onClick: () => void
    onClose: () => void
}

interface IHideNotification {
    type: "HIDE_NOTIFICATION"
    id: string
}

export type NotificationAction = IShowNotification | IHideNotification

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
                    onClick: action.onClick,
                    onClose: action.onClose,
                    expirationTime: action.expirationTime,
                },
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

const hideNotificationAfterExpirationEpic: Epic<NotificationAction, INotificationsState> = (
    action$,
    store,
) => {
    let currentExpTime: number
    return action$
        .ofType("SHOW_NOTIFICATION")
        .filter((action: IShowNotification) => action.expirationTime === -1)
        .map(({ expirationTime }: IShowNotification) => (currentExpTime = expirationTime))
        .delay(currentExpTime)
        .map((action: IShowNotification) => ({ type: "HIDE_NOTIFICATION", id: action.id }))
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
    return createReduxStore("Notifications", stateReducer, DefaultNotificationState, [
        createEpicMiddleware(combineEpics(hideNotificationAfterExpirationEpic)),
    ])
}
