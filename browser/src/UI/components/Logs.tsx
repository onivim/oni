import * as React from "react"

import { connect } from "react-redux"
import * as State from "./../State"

import {ILog, LogType} from "./../Logs"

import * as ActionCreators from "./../ActionCreators"

import { Icon } from "./../Icon"

require("./Logs.less") // tslint:disable-line no-var-requires

export interface ILogsProps {
    visible: boolean
    logs: Array<{
        log: ILog,
        folded: boolean,
    }>
    toggleFold: (index: number) => void
    hide: () => void
}

export class LogsRenderer extends React.Component<ILogsProps, void> {
    public render(): JSX.Element {
        // TODO copy details to clipboard
        if (!this.props.visible) { return null }

        const maxHeightStyle: React.CSSProperties = {
            "height": "25vh",
            "maxHeight": "25vh",
            "overflow": "auto",
        }
        // maxHeight wrapper so table scrolls while header stays
        return <div className="logs">
            <div className="logs-header clickable"
                 onClick={this.props.hide}>
                Logs
                <span className="logs-header-close">
                    <Icon name="times" />
                </span>
            </div>
            <div style={maxHeightStyle}>
                <table>
                    {makeLogRows(this.props.logs, this.props.toggleFold)}
                </table>
            </div>
        </div>

        function makeLogRows(logs: Array<{log: ILog, folded: boolean}>, toggleFold: (index: number) => void) {
            return logs.map((l, i) => {
                const hasDetails =
                    l.log.details &&
                    l.log.details.length > 0
                const handleClick = () => {
                    if (hasDetails) {
                        toggleFold(i)
                    }
                }
                return <tbody key={i}>
                    <tr className={typeToClass(l.log.type)}>
                        <td className="log-icon">
                            <Icon name={typeToIcon(l.log.type)} />
                        </td>
                        <td>
                            <div tabIndex={-1}
                                 className={"log-message" + (hasDetails ? " clickable" : "")}
                                 onClick={handleClick}>
                                {l.log.message}
                                {makeChevron(l)}
                            </div>
                        </td>
                    </tr>
                    {makeDetails(l)}
                </tbody>
            })
        }
        function makeChevron(l: {log: ILog, folded: boolean}) {
            if (l.log.details && l.log.details.length > 0) {
                if (l.folded) {
                    return <span className="log-unfold-icon">
                        <Icon name="chevron-down" />
                    </span>
                } else {
                    return <span className="log-unfold-icon">
                        <Icon name="chevron-up" />
                    </span>
                }
            } else {
                return null
            }
        }
        function makeDetails(l: {log: ILog, folded: boolean}) {
            const shouldShowDetails =
                l.log.details &&
                l.log.details.length > 0 &&
                !l.folded
            if (shouldShowDetails) {
                let detailLines = l.log.details.map((det, i) => {
                    return <div className="log-detail-line" key={i}>{det}</div>
                })
                return <tr>
                    <td className="log-icon"></td>
                    <td className="log-details-cell">
                        <div className="log-details">
                            {detailLines}
                        </div>
                    </td>
                </tr>
            } else {
                return null
            }
        }
        function typeToIcon(nt: LogType): string {
            switch (nt) {
                case "success": return "check"
                case "info": return "comment"
                case "warning": return "exclamation-triangle"
                case "error": return "fire"
                case "fatal": return "bug"
                default: return "asterisk"
            }
        }
        function typeToClass(nt: LogType): string {
            switch (nt) {
                case "success": return "log-success"
                case "info": return "log-info"
                case "warning": return "log-warning"
                case "error": return "log-error"
                case "fatal": return "log-fatal"
                default: return ""
            }
        }
    }
}
function mapStateToProps(s: State.IState): Partial<ILogsProps> {
    return {
        visible: s.logsVisible,
        logs: s.logs,
    }
}

const mapDispatchToProps = (dispatch: any): Partial<ILogsProps> => {
    const toggleFold = (index: number) => dispatch(ActionCreators.toggleLogFold(index))
    const hide = () => dispatch(ActionCreators.changeLogsVisibility(false))
    return {toggleFold, hide}
}

export const Logs = connect(mapStateToProps, mapDispatchToProps)(LogsRenderer)
