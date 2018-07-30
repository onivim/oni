import { Commands } from "oni-api"
import * as React from "react"
import { connect } from "react-redux"

import styled, { css, sidebarItemSelected, withProps } from "../../UI/components/common"
import TextInputView from "../../UI/components/LightweightText"
import { VimNavigator } from "../../UI/components/VimNavigator"
import { ISession, ISessionState, SessionActions } from "./"

interface IProps {
    setupCommands: (command: Commands.ICommand) => void
}

interface IStateProps {
    sessions: ISession[]
    active: boolean
    creating: boolean
    selected: ISession
}

interface ISessionActions {
    populateSessions: () => void
    updateSelection: (selected: string) => void
    getAllSessions: (sessions: ISession[]) => void
    updateSession: (session: ISession) => void
    restoreSession: (session: string) => void
    persistSession: (session: string) => void
    createSession: () => void
    cancelCreating: () => void
}

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
            <div>Last updated at: {new Date(session.updatedAt).toUTCString()}</div>
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
    public readonly _inputID = "new_session"

    public state = {
        sessionName: "",
    }

    public async componentDidMount() {
        this.props.populateSessions()
    }

    public updateSelection = (selected: string) => {
        this.props.updateSelection(selected)
    }

    public handleSelection = async (newSessionName: string) => {
        const { sessionName } = this.state
        const inputSelected = newSessionName === this._inputID
        switch (true) {
            case inputSelected && this.props.creating:
                await this.props.persistSession(sessionName)
                break
            case inputSelected && !this.props.creating:
                this.props.createSession()
                break
            case !inputSelected:
                const { selected } = this.props
                await this.props.restoreSession(selected.name)
                break
            default:
                break
        }
    }

    public restoreSession = (selected: string) => {
        this.props.restoreSession(selected)
    }

    public handleChange: React.ChangeEventHandler<HTMLInputElement> = evt => {
        const { value } = evt.currentTarget
        this.setState({ sessionName: value })
    }

    public persistSession = async () => {
        const { sessionName } = this.state
        if (sessionName) {
            await this.props.persistSession(sessionName)
        }
    }

    public handleCancel = () => {
        if (this.props.creating) {
            this.props.cancelCreating()
        }
        this.setState({ sessionName: "" })
    }

    public render() {
        const { sessions, active, creating } = this.props
        const ids = [this._inputID, ...sessions.map(({ id }) => id)]
        return (
            <VimNavigator
                ids={ids}
                active={active}
                onSelected={this.handleSelection}
                onSelectionChanged={this.updateSelection}
                render={selectedId => (
                    <List>
                        <ListItem isSelected={selectedId === this._inputID}>
                            {creating ? (
                                <TextInputView
                                    styles={inputStyles}
                                    onChange={this.handleChange}
                                    onCancel={this.handleCancel}
                                    onComplete={this.persistSession}
                                    defaultValue="Enter a new Session Name"
                                />
                            ) : (
                                <div>Create a new session</div>
                            )}
                        </ListItem>
                        {sessions.length ? (
                            sessions.map(session => (
                                <SessionItem
                                    key={session.id}
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

const mapStateToProps = ({ sessions, selected, active, creating }: ISessionState): IStateProps => ({
    sessions,
    active,
    creating,
    selected,
})

export default connect<IStateProps, ISessionActions, IProps>(mapStateToProps, SessionActions)(
    Sessions,
)
