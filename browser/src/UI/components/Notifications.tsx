import * as React from "react"

import { connect } from "react-redux"
import * as State from "./../State"

import {INotification, NotificationType} from "./../Notifications"

import * as ActionCreators from "./../ActionCreators"

import { Icon } from "./../Icon"

require("./Notifications.less") // tslint:disable-line no-var-requires

export interface INotificationsProps {
    visible: boolean
    notifications: Array<{
        notification: INotification,
        folded: boolean,
    }>
    toggleFold: (index: number) => void
    hide: () => void
}

export class NotificationsRenderer extends React.Component<INotificationsProps, void> {
    public render(): JSX.Element {
        // TODO copy details to clipboard
        if (!this.props.visible) { return null }

        const maxHeightStyle = {
            "height": "25vh",
            "maxHeight": "25vh",
            "overflow": "auto",
        }
        // maxHeight wrapper so table scrolls while header stays
        return <div className="notification-logs">
            <div className="notification-logs-header clickable"
                 onClick={this.props.hide}>
                Logs
                <span className="notification-logs-header-close">
                    <Icon name="times" />
                </span>
            </div>
            <div style={maxHeightStyle}>
                <table>
                    {makeNotificationRows(this.props.notifications, this.props.toggleFold)}
                </table>
            </div>
        </div>

        function makeNotificationRows(notifications: Array<{notification: INotification, folded: boolean}>, toggleFold: (index: number) => void) {
            return notifications.map((n, i) => {
                const hasDetails =
                    n.notification.details &&
                    n.notification.details.length > 0
                const handleClick = () => {
                    if (hasDetails) {
                        toggleFold(i)
                    }
                }
                return <tbody key={i}>
                    <tr className={typeToClass(n.notification.type)}>
                        <td className="notification-icon">
                            <Icon name={typeToIcon(n.notification.type)} />
                        </td>
                        <td>
                            <div tabIndex={-1}
                                 className={"notification-message" + (hasDetails ? " clickable" : "")}
                                 onClick={handleClick}>
                                {n.notification.message}
                                {makeChevron(n)}
                            </div>
                        </td>
                    </tr>
                    {makeDetails(n)}
                </tbody>
            })
        }
        function makeChevron(n: {notification: INotification, folded: boolean}) {
            if (n.notification.details && n.notification.details.length > 0) {
                if (n.folded) {
                    return <span className="notification-unfold-icon">
                        <Icon name="chevron-down" />
                    </span>
                } else {
                    return <span className="notification-unfold-icon">
                        <Icon name="chevron-up" />
                    </span>
                }
            } else {
                return null
            }
        }
        function makeDetails(n: {notification: INotification, folded: boolean}) {
            const shouldShowDetails =
                n.notification.details &&
                n.notification.details.length > 0 &&
                !n.folded
            if (shouldShowDetails) {
                let detailLines = n.notification.details.map((det, i) => {
                    return <div className="notification-detail-line" key={i}>{det}</div>
                })
                return <tr>
                    <td className="notification-icon"></td>
                    <td className="notification-details">
                        {detailLines}
                    </td>
                </tr>
            } else {
                return null
            }
        }
        function typeToIcon(nt: NotificationType): string {
            switch (nt) {
                case "success": return "check"
                case "info": return "comment"
                case "warning": return "exclamation-triangle"
                case "error": return "fire"
                case "fatal": return "bug"
                default: return "asterisk"
            }
        }
        function typeToClass(nt: NotificationType): string {
            switch (nt) {
                case "success": return "notification-success"
                case "info": return "notification-info"
                case "warning": return "notification-warning"
                case "error": return "notification-error"
                case "fatal": return "notification-fatal"
                default: return ""
            }
        }
    }
}
function mapStateToProps(s: State.IState): Partial<INotificationsProps> {
    return {
        visible: s.notificationsVisible,
        notifications: s.notifications,
    }
}

const mapDispatchToProps = (dispatch: any): Partial<INotificationsProps> => {
    const toggleFold = (index: number) => dispatch(ActionCreators.toggleNotificationFold(index))
    const hide = () => dispatch(ActionCreators.changeNotificationsVisibility(false))
    return {toggleFold, hide}
}

export const Notifications = connect(mapStateToProps, mapDispatchToProps)(NotificationsRenderer)
