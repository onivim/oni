/**
 * NotificationStore.ts
 *
 * State management for Notifications
 */

import { Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"
import { Observable } from "rxjs"
import { createStore as createReduxStore } from "oni-core-redux"

export type NotificationLevel = "info" | "warn" | "error" | "success"

export interface INotificationButton {
    title: string
    callback: (args?: any) => void
}

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
    buttons?: INotificationButton[]
    onClick: () => void
    onClose: () => void
}

interface IShowNotification {
    type: "SHOW_NOTIFICATION"
    id: string
    level: NotificationLevel
    buttons: INotificationButton[]
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
                    buttons: action.buttons,
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
    return action$
        .ofType("SHOW_NOTIFICATION")
        .filter((action: IShowNotification) => !!action.expirationTime)
        .mergeMap(({ expirationTime, id }: IShowNotification) => {
            return Observable.timer(expirationTime).mapTo({
                type: "HIDE_NOTIFICATION",
                id,
            } as IHideNotification)
        })
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
