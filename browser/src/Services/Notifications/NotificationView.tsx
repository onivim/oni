/**
 * NotificationManager.ts
 *
 * Implements API surface area for working with notifications
 */

import * as React from "react"

export interface INotificationViewProps {
    backgroundColor: string
    iconColor: string
    title: string
    icon: string
}

export interface INotificationsViewProps {
    notifications: INotificationViewProps[]
}

export class NotificationsView extends React.PureComponent<INotificationsViewProps, {}> {

    public render(): JSX.Element {
        return <div>Hello world</div>
    }
}

