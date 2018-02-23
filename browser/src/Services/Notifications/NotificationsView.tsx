/**
 * NotificationsView.tsx
 *
 * View / React layer for Notifications
 */

import * as React from "react"

import { connect, Provider } from "react-redux"

import { CSSTransition, TransitionGroup } from "react-transition-group"

import { INotification, INotificationsState } from "./NotificationStore"

import { boxShadow, keyframes, styled, withProps } from "./../../UI/components/common"
import { Icon, IconSize } from "./../../UI/Icon"

export interface NotificationsViewProps {
    notifications: INotification[]
}

const Transition = (props: { children: any }) => {
    return (
        <CSSTransition {...props} timeout={1000} classNames="notification">
            {props.children}
        </CSSTransition>
    )
}

const NotificationsWrapper = styled.div`
    position: absolute;
    top: 16px;
    right: 16px;
    max-height: 90%;
    width: 30%;
    pointer-events: all;
    overflow: auto;

    .notification:first-child {
        margin-top: 0;
    }
`

export class NotificationsView extends React.PureComponent<NotificationsViewProps, {}> {
    public render(): JSX.Element {
        return (
            <NotificationsWrapper>
                <TransitionGroup>
                    {this.props.notifications.map(notification => {
                        return (
                            <Transition>
                                <NotificationView {...notification} key={notification.id} />
                            </Transition>
                        )
                    })}
                </TransitionGroup>
            </NotificationsWrapper>
        )
    }
}

const frames = keyframes`
    0% { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0px); }
`

type Level = "warn" | "info" | "error"

interface IErrorStyles {
    level?: Level
}

const getColorForErrorLevel = (level: Level) => {
    const colorToLevel = {
        warn: "red",
        error: "yellow",
        info: "white",
    }

    return colorToLevel[level]
}

const NotificationWrapper = withProps<IErrorStyles>(styled.div)`
    background-color: ${p => p.theme["toolTip.background"]};
    border-radius: 4px;
    padding: 0 1rem 1rem;
    color: white;
    margin: 1rem 0 1rem 1rem;
    ${boxShadow};

    max-height: 50%;

    display: flex;
    flex: auto;
    flex-direction: column;

    justify-content: center;
    align-items: center;

    pointer-events: auto;
    cursor: pointer;

    overflow: hidden;
    transition: all 0.1s ease-in;

    &.notification-enter {
        animation: ${frames} 0.25s ease-in;
    }

    &.notification-exit {
        animation: ${frames} 0.25s ease-in both reverse;
    }

    &:hover {
        transform: translateY(-1px);
    }
`

const IconContainer = styled.div`
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`

const NotificationIconWrapper = withProps<IErrorStyles>(styled.div)`
    ${({ level }) => level && `color: ${getColorForErrorLevel(level)};`};
    flex: 0 0 auto;
    align-self: flex-start;

    padding: 8px;

    &:hover {
        ${boxShadow};
        transform: translateY(-1px);
    }
`

const NotificationContents = styled.div`
    flex: 1 1 auto;
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 8px;

    overflow-y: auto;
    overflow-x: hidden;
`

const NotificationTitle = withProps<IErrorStyles>(styled.div)`
    ${({ level }) => level && `color: ${getColorForErrorLevel(level)};`};
    flex: 0 0 auto;
    width: 100%;
    word-break: break-word;
    font-weight: bold;
    font-size: 1.1em;
`

const NotificationDescription = styled.div`
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    margin: 1em 0em;

    font-size: 0.9em;
`

const NotificationHeader = styled.header`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${p => p.theme["toolTip.border"]};
    padding: 0.5rem;
`

export class NotificationView extends React.PureComponent<INotification, {}> {
    public render(): JSX.Element {
        return (
            <NotificationWrapper
                key={this.props.id}
                onClick={this.props.onClick}
                className="notification"
                level={this.props.level}
            >
                <NotificationHeader>
                    <IconContainer>
                        <NotificationIconWrapper level={this.props.level}>
                            <Icon size={IconSize.Large} name="exclamation-triangle" />
                        </NotificationIconWrapper>
                        <NotificationIconWrapper onClick={evt => this._onClickClose(evt)}>
                            <Icon size={IconSize.Large} name="times" />
                        </NotificationIconWrapper>
                    </IconContainer>
                    <NotificationTitle level={this.props.level}>
                        {this.props.title}
                    </NotificationTitle>
                </NotificationHeader>
                <NotificationContents>
                    <NotificationDescription>{this.props.detail}</NotificationDescription>
                </NotificationContents>
            </NotificationWrapper>
        )
    }

    private _onClickClose(evt: React.MouseEvent<HTMLElement>): void {
        this.props.onClose()
        evt.stopPropagation()
        evt.preventDefault()
    }
}

export const mapStateToProps = (state: INotificationsState): NotificationsViewProps => {
    const objs = Object.keys(state.notifications).map(key => state.notifications[key])

    const activeNotifications = objs.filter(o => o !== null)

    return {
        notifications: activeNotifications,
    }
}

const NotificationsContainer = connect(mapStateToProps)(NotificationsView)

export const getView = (store: any) => (
    <Provider store={store}>
        <NotificationsContainer />
    </Provider>
)
