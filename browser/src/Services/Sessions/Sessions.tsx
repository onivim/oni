import * as React from "react"
import { connect } from "react-redux"

import styled, { css, sidebarItemSelected, withProps } from "../../UI/components/common"
import TextInputView from "../../UI/components/LightweightText"
import { VimNavigator } from "../../UI/components/VimNavigator"
import { ISession, ISessionState, SessionActions } from "./"

interface IConnectedProps extends IStateProps, ISessionActions {}

interface ISessionItem {
    session: ISession
    isSelected: boolean
}

const SessionItem: React.SFC<ISessionItem> = ({ session, isSelected }) => {
    return (
        <ListItem isSelected={isSelected}>
            <div>Name: {session.name}</div>
            <div>File: {session.file}</div>
        </ListItem>
    )
}

const inputStyles = css`
    background-color: transparent;
    width: 100%;
    font-family: inherit;
    font-size: inherit;
    color: ${p => p.theme["sidebar.foreground"]};
`

const ListItem = withProps<Partial<ISessionItem>>(styled.li)`
    ${sidebarItemSelected};
    padding: 0.5em;
`

const List = styled.ul`
    list-style-type: none;
    padding: 0;
`

interface IState {
    sessionName: string
}

class Sessions extends React.PureComponent<IConnectedProps, IState> {
    public state = {
        sessionName: "",
    }

    public async componentDidMount() {
        this.props.populateSessions()
    }

    public updateSelection = (selected: string) => {
        this.props.updateSelection(selected)
    }

    public restoreSession = (selected: string) => {
        this.props.restoreSession(selected)
    }

    public handleChange: React.ChangeEventHandler<HTMLInputElement> = evt => {
        const { value } = evt.currentTarget
        this.setState({ sessionName: value })
    }

    public persistSession = () => {
        const { sessionName } = this.state
        if (sessionName) {
            this.props.persistSession(sessionName)
        }
    }

    public handleCancel = () => {
        this.setState({ sessionName: "" })
    }

    public render() {
        const { sessions, active } = this.props
        const ids = ["input", ...sessions.map(({ id }) => id)]
        return (
            <VimNavigator
                ids={ids}
                active={active}
                onSelected={this.restoreSession}
                onSelectionChanged={this.updateSelection}
                render={selectedId => (
                    <List>
                        <ListItem isSelected={selectedId === "input"}>
                            <TextInputView
                                shouldFocus={false}
                                styles={inputStyles}
                                onChange={this.handleChange}
                                onCancel={this.handleCancel}
                                onComplete={this.persistSession}
                                defaultValue="Enter a new Session Name"
                            />
                        </ListItem>
                        {sessions.length ? (
                            sessions.map(session => (
                                <SessionItem
                                    session={session}
                                    isSelected={selectedId === session.id}
                                />
                            ))
                        ) : (
                            <div>No Sessions Saved</div>
                        )}
                    </List>
                )}
            />
        )
    }
}

interface IStateProps {
    sessions: ISession[]
    active: boolean
}

interface ISessionActions {
    populateSessions: () => void
    updateSelection: (selected: string) => void
    getAllSessions: (sessions: ISession[]) => void
    updateSession: (session: ISession) => void
    restoreSession: (session: string) => void
    persistSession: (session: string) => void
}

const mapStateToProps = ({ sessions, active }: ISessionState): IStateProps => ({
    sessions,
    active,
})

export default connect<IStateProps, ISessionActions>(mapStateToProps, SessionActions)(Sessions)
