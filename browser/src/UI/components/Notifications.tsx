import * as React from "react"

import { connect } from "react-redux"
import * as State from "./../State"

import {INotification, NotificationType} from "./../Notifications"

import * as ActionCreators from "./../ActionCreators"

import { Icon } from "./../Icon"

require("./Notifications.less") // tslint:disable-line no-var-requires

export interface INotificationsProps {
    notifications: Array<{
        notification: INotification,
        folded: boolean,
    }>
    toggleFold: (index: number) => void
}

export class NotificationsRenderer extends React.Component<INotificationsProps, void> {
    public render(): JSX.Element {
        // TODO unfold detail
        // TODO copy details to clipboard
        const maxHeightStyle = {"maxHeight": "300px", "overflow": "auto"}
        // Div wrapper so table scrolls while header stays
        return <div className="notification-logs">
            <div className="notification-logs-header">Logs</div>
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
                return <tbody>
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
                let detailLines = n.notification.details.map((det) => {
                    return <div className="notification-detail-line">{det}</div>
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
    return {notifications: s.notifications}
}

const mapDispatchToProps = (dispatch: any): Partial<INotificationsProps> => {
    const toggleFold = (index: number) => dispatch(ActionCreators.toggleNotificationFold(index))
    return {toggleFold}
}

export const Notifications = connect(mapStateToProps, mapDispatchToProps)(NotificationsRenderer)
