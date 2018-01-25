/**
 * NotificationsView.tsx
 *
 * View / React layer for Notifications
 */

import * as React from "react"

import { connect, Provider } from "react-redux"

import styled, { keyframes } from "styled-components"

import { CSSTransition, TransitionGroup } from "react-transition-group"

import { INotification, INotificationsState } from "./NotificationStore"

import { Icon, IconSize } from "./../../UI/Icon"

export interface NotificationsViewProps {
    notifications: INotification[]
}

const Transition = (props: { children: any }) => {
     return <CSSTransition
    {...props}
    timeout={1000}
    classNames="notification"
  >
    {props.children}
  </CSSTransition>

}

const NotificationsWrapper = styled.div`
    position: absolute;
    top: 16px;
    right: 16px;
`

export class NotificationsView extends React.PureComponent<NotificationsViewProps, {}> {
    public render(): JSX.Element {
        return  <NotificationsWrapper>
            <TransitionGroup>
            {this.props.notifications.map((notification) => {
                return <Transition>
                    <NotificationView {...notification} key={notification.id} />
                        </Transition>
            })}
                </TransitionGroup>
            </NotificationsWrapper>
    }
}

const frames = keyframes`
    0% { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0px); }
`

const NotificationWrapper = styled.div`
    background-color: red;
    color: white;
    width: 20em;
    height: 4em;

    margin: 1em;

    display: flex;
    flex-direction: row;

    justify-content: center;
    align-items: center;

    pointer-events: auto;
    cursor: pointer;

    overflow: hidden;

    &.notification-enter {
        animation: ${frames} 0.25s ease-in;
    }

    &:hover {
        transform: translateY(-1px);
    }
`

const NotificationIconWrapper = styled.div`
    flex: 0 0 auto;

    margin: 8px;
`

const NotificationContents = styled.div`
    flex: 1 1 auto;

    display: flex;
    flex-direction: column;
    justify-content: center;

    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
`

const NotificationTitle = styled.div`
    flex: 0 0 auto;

    font-weight: bold;
    font-size: 1.1em;
`

const NotificationDescription = styled.div`
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: none;

    font-size: 0.9em;
`

// export interface NotificationViewProps extends INotification { }

export class NotificationView extends React.PureComponent<INotification, {}> {
    public render(): JSX.Element {
        return <NotificationWrapper key={this.props.id}>
                <NotificationIconWrapper>
                    <Icon size={IconSize.Large} name="exclamation-triangle" />
                </NotificationIconWrapper>
                <NotificationContents>
                    <NotificationTitle>{this.props.title}</NotificationTitle>
                    <NotificationDescription>{this.props.detail}</NotificationDescription>
                </NotificationContents>
                <NotificationIconWrapper>
                    <Icon size={IconSize.Large} name="times" />
                </NotificationIconWrapper>
            </NotificationWrapper>
    }
}

export const mapStateToProps = (state: INotificationsState): NotificationsViewProps => {
    const objs = Object.keys(state.notifications).map((key) => state.notifications[key])

    const activeNotifications = objs.filter(o => o !== null)

    return {
        notifications: activeNotifications,
    }
}

const NotificationsContainer = connect(mapStateToProps)(NotificationsView)

export const getView = (store: any) => <Provider store={store}><NotificationsContainer /></Provider>
