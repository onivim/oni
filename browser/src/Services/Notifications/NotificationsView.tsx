/**
 * NotificationsView.tsx
 *
 * View / React layer for Notifications
 */

import * as React from "react"

import { connect, Provider } from "react-redux"

import { CSSTransition, TransitionGroup } from "react-transition-group"

import {
    INotification,
    INotificationButton,
    INotificationsState,
    NotificationLevel,
} from "./NotificationStore"

import { boxShadow, keyframes, lighten, styled, withProps } from "./../../UI/components/common"
import { Sneakable } from "./../../UI/components/Sneakable"
import { Icon, IconSize } from "./../../UI/Icon"

export interface NotificationsViewProps {
    notifications: INotification[]
}

const Transition = (props: { children: React.ReactNode }) => {
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
    max-width: 25rem;
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

interface IErrorStyles {
    level?: NotificationLevel
}

const getColorForErrorLevel = (level: NotificationLevel) => {
    const colorToLevel = {
        warn: "yellow",
        error: "red",
        info: "#1D7CF2", // blue
        success: "#5AB379", // green
    }

    return colorToLevel[level]
}

const NotificationWrapper = withProps<IErrorStyles>(styled.div)`
    background-color: ${p => p.theme["toolTip.background"]};
    border-radius: 4px;
    border-left: solid 4px ${p => getColorForErrorLevel(p.level)};
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

export const NotificationContents = styled.div`
    flex: 1 1 auto;
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 8px;

    overflow-y: auto;
    overflow-x: hidden;
`

export const NotificationTitle = withProps<IErrorStyles>(styled.div)`
    ${({ level }) => level && `color: ${getColorForErrorLevel(level)};`};
    flex: 0 0 auto;
    width: 100%;
    word-break: break-word;
    font-weight: bold;
    font-size: 1.1em;
`

export const NotificationDescription = styled.div`
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

const ButtonRow = styled.div`
    width: 100%;
    height: 10%;
    display: flex;
    justify-content: flex-end;
`

export const Button = styled.button`
    border: none;
    cursor: pointer;
    text-align: center;
    overflow: hidden;
    min-width: 5em;
    min-height: 2em;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: inherit;
    display: inline-block;
    margin: 0 0.5em;
    ${boxShadow};
    ${({ theme }) => `
        background-color: ${lighten(theme["editor.background"], 0.25)};
        color: ${theme["editor.foreground"]};
    `};
`

interface IButtonProps {
    buttons: INotificationButton[]
}

const Buttons = ({ buttons }: IButtonProps) => {
    return (
        <ButtonRow>
            {buttons.map(({ callback, title }) => (
                <Sneakable callback={callback}>
                    <Button onClick={callback}>{title}</Button>
                </Sneakable>
            ))}
        </ButtonRow>
    )
}

export class NotificationView extends React.PureComponent<INotification, {}> {
    private iconDictionary = {
        error: "times-circle",
        warn: "exclamation-triangle",
        info: "info-circle",
        success: "check-circle",
    }

    public render(): JSX.Element {
        const { level, buttons } = this.props
        return (
            <NotificationWrapper
                key={this.props.id}
                onClick={this.props.onClick}
                className="notification"
                level={level}
            >
                <NotificationHeader>
                    <IconContainer>
                        <NotificationIconWrapper level={level}>
                            <Sneakable callback={this.props.onClick}>
                                <Icon size={IconSize.Large} name={this.iconDictionary[level]} />
                            </Sneakable>
                        </NotificationIconWrapper>
                        <NotificationIconWrapper onClick={evt => this._onClickClose(evt)}>
                            <Sneakable callback={this.props.onClose}>
                                <Icon size={IconSize.Large} name="times" />
                            </Sneakable>
                        </NotificationIconWrapper>
                    </IconContainer>
                    <NotificationTitle level={level}>{this.props.title}</NotificationTitle>
                </NotificationHeader>
                <NotificationContents>
                    <NotificationDescription className="notification-description">
                        {this.props.detail}
                    </NotificationDescription>
                </NotificationContents>
                {buttons && <Buttons buttons={buttons} />}
            </NotificationWrapper>
        )
    }

    private _onClickClose = (evt: React.MouseEvent<HTMLElement>): void => {
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
