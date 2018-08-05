import * as path from "path"
import * as React from "react"
import { connect } from "react-redux"

import SectionTitle from "../../UI/components/SectionTitle"
import { Icon } from "../../UI/Icon"

import styled, { css, sidebarItemSelected, withProps } from "../../UI/components/common"
import TextInputView from "../../UI/components/LightweightText"
import { VimNavigator } from "../../UI/components/VimNavigator"
import { ISession, ISessionState, SessionActions } from "./"

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
    onClick: () => void
}

const Container = styled.div`
    padding: 0 1em;
`

const SessionItem: React.SFC<ISessionItem> = ({ session, isSelected, onClick }) => {
    const truncatedWorkspace = session.workspace
        .split(path.sep)
        .slice(-2)
        .join(path.sep)

    return (
        <ListItem isSelected={isSelected} onClick={onClick}>
            <div>
                <strong>
                    <Icon name="file" /> Name: {session.name}
                </strong>
            </div>
            <div>Workspace: {truncatedWorkspace}</div>
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
    showAll: boolean
}

interface IIDs {
    input: string
    title: string
}

class Sessions extends React.PureComponent<IConnectedProps, IState> {
    public readonly _ID: Readonly<IIDs> = {
        input: "new_session",
        title: "title",
    }

    public state = {
        sessionName: "",
        showAll: true,
    }

    public async componentDidMount() {
        this.props.populateSessions()
    }

    public updateSelection = (selected: string) => {
        this.props.updateSelection(selected)
    }

    public handleSelection = async (id: string) => {
        const { sessionName } = this.state
        const inputSelected = id === this._ID.input
        const isTitle = id === this._ID.title
        const isReadonlyField = id in this._ID
        switch (true) {
            case inputSelected && this.props.creating:
                await this.props.persistSession(sessionName)
                break
            case inputSelected && !this.props.creating:
                this.props.createSession()
                break
            case isTitle:
                this.setState({ showAll: !this.state.showAll })
                break
            case isReadonlyField:
                break
            default:
                const { selected } = this.props
                await this.props.restoreSession(selected.name)
                break
        }
    }

    public restoreSession = async (selected: string) => {
        if (selected) {
            await this.props.restoreSession(selected)
        }
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
        const { showAll } = this.state
        const { sessions, active, creating } = this.props
        const ids = [this._ID.title, this._ID.input, ...sessions.map(({ id }) => id)]
        return (
            <VimNavigator
                ids={ids}
                active={active}
                onSelected={this.handleSelection}
                onSelectionChanged={this.updateSelection}
                render={selectedId => (
                    <List>
                        <SectionTitle
                            active
                            count={sessions.length}
                            title="All Sessions"
                            testId="sessions-title"
                            isSelected={selectedId === this._ID.title}
                            onClick={() => this.handleSelection(selectedId)}
                        />
                        {showAll && (
                            <>
                                <ListItem isSelected={selectedId === this._ID.input}>
                                    {creating ? (
                                        <TextInputView
                                            styles={inputStyles}
                                            onChange={this.handleChange}
                                            onCancel={this.handleCancel}
                                            onComplete={this.persistSession}
                                            defaultValue="Enter a new Session Name"
                                        />
                                    ) : (
                                        <div onClick={() => this.handleSelection(selectedId)}>
                                            <Icon name="pencil" /> Create a new session
                                        </div>
                                    )}
                                </ListItem>
                                {sessions.length ? (
                                    sessions.map((session, idx) => (
                                        <SessionItem
                                            key={session.id}
                                            session={session}
                                            isSelected={selectedId === session.id}
                                            onClick={() => this.handleSelection(selectedId)}
                                        />
                                    ))
                                ) : (
                                    <Container>No Sessions Saved</Container>
                                )}
                            </>
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

export default connect<IStateProps, ISessionActions>(mapStateToProps, SessionActions)(Sessions)
