import * as React from "react"
import { connect } from "react-redux"

import { ISession, ISessionState } from "./"

interface IProps {
    populateExistingSessions: () => Promise<void>
}

interface IConnectedProps extends IStateProps, IProps {}

class Sessions extends React.Component<IConnectedProps> {
    public async componentDidMount() {
        await this.props.populateExistingSessions()
    }
    public render() {
        return (
            <div>
                {this.props.sessions.length ? (
                    this.props.sessions.map(session => <li>{session.name}</li>)
                ) : (
                    <div>No Sessions Saved</div>
                )}
            </div>
        )
    }
}

interface IStateProps {
    sessions: ISession[]
}

const mapStateToProps = ({ sessions }: ISessionState): IStateProps => ({
    sessions,
})

export default connect<IStateProps, {}, IProps>(mapStateToProps)(Sessions)
