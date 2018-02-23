/**
 * NotificationsView.tsx
 *
 * View / React layer for Notifications
 */

import * as React from "react"

import { connect, Provider } from "react-redux"
import { AutoSizer } from "react-virtualized"

import styled, { keyframes } from "styled-components"

import { CSSTransition, TransitionGroup } from "react-transition-group"

import { INotification, INotificationsState } from "./NotificationStore"

import { boxShadow, withProps } from "./../../UI/components/common"
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
    max-height: 50%;
`

export class NotificationsView extends React.PureComponent<NotificationsViewProps, {}> {
    public render(): JSX.Element {
        return (
            <NotificationsWrapper>
                <TransitionGroup>
                    <AutoSizer>
                        {({ height, width }) =>
                            this.props.notifications.map(notification => {
                                return (
                                    <Transition>
                                        <NotificationView
                                            height={height}
                                            width={width}
                                            {...notification}
                                            key={notification.id}
                                        />
                                    </Transition>
                                )
                            })
                        }
                    </AutoSizer>
                </TransitionGroup>
            </NotificationsWrapper>
        )
    }
}

const frames = keyframes`
    0% { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0px); }
`

const NotificationWrapper = withProps<IStyleProps>(styled.div)`
    background-color: ${p => (!p.warn ? p.theme["editor.hover.content.background"] : "red")};
    color: white;
    width: ${p => p.width};

    margin: 1em;
    max-height: 50%;
    height: ${p => p.height};

    display: flex;
    flex-direction: row;

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
        ${boxShadow};
        transform: translateY(-1px);
    }
`

const NotificationIconWrapper = withProps<{ color?: string }>(styled.div)`
    ${({ color }) => color && `color: ${color};`};
    flex: 0 0 auto;

    padding: 16px;

    &:hover {
        ${boxShadow};
        transform: translateY(-1px);
    }
`

const NotificationContents = styled.div`
    flex: 1 1 auto;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 8px;

    overflow-y: auto;
    overflow-x: hidden;
`

const NotificationTitle = styled.div`
    flex: 0 0 auto;

    font-weight: bold;
    font-size: 1.1em;

    margin-top: 0.5em;
`

const NotificationDescription = styled.div`
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    margin: 1em 0em;

    font-size: 0.9em;
`

// export interface NotificationViewProps extends INotification { }

interface IStyleProps {
    height: number
    width: number
    warn?: boolean
}

export class NotificationView extends React.PureComponent<INotification & IStyleProps, {}> {
    public render(): JSX.Element {
        const { width, height } = this.props
        return (
            <NotificationWrapper
                width={width}
                height={height}
                key={this.props.id}
                onClick={this.props.onClick}
                className="notification"
            >
                <NotificationIconWrapper color="red">
                    <Icon size={IconSize.Large} name="exclamation-triangle" />
                </NotificationIconWrapper>
                <NotificationContents>
                    <NotificationTitle>{this.props.title}</NotificationTitle>
                    <NotificationDescription>{this.props.detail}</NotificationDescription>
                </NotificationContents>
                <NotificationIconWrapper onClick={evt => this._onClickClose(evt)}>
                    <Icon size={IconSize.Large} name="times" />
                </NotificationIconWrapper>
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
