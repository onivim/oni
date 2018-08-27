import * as React from "react"
import { connect } from "react-redux"

import { styled } from "./../../UI/components/common"
import { SectionTitle, Title } from "./../../UI/components/SectionTitle"
import CommitsSection from "./../../UI/components/VersionControl/Commits"
import Help from "./../../UI/components/VersionControl/Help"
import StagedSection from "./../../UI/components/VersionControl/Staged"
import VersionControlStatus from "./../../UI/components/VersionControl/Status"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { IDsMap } from "./VersionControlPane"
import { Logs, StatusResult } from "./VersionControlProvider"
import {
    PrevCommits,
    ProviderActions,
    VersionControlActions,
    VersionControlState,
} from "./VersionControlStore"

const StatusContainer = styled.div`
    overflow-x: hidden;
    overflow-y: auto;
`

interface IStateProps {
    loading: boolean
    filesToCommit: string[]
    loadingSection: ProviderActions
    status: StatusResult
    hasFocus: boolean
    hasError: boolean
    activated: boolean
    committing: boolean
    message: string[]
    selectedItem: string
    commits: PrevCommits[]
    showHelp: boolean
    logs: Logs
}

interface IDispatchProps {
    cancelCommit: () => void
    updateCommitMessage: (message: string[]) => void
    setLoading: (loading: boolean) => void
}

interface IProps {
    IDs: IDsMap
    setError?: (e: Error) => void
    commit?: (message: string[], files?: string[]) => Promise<void>
    updateSelection?: (selection: string) => void
    handleSelection?: (selection: string) => void
    getStatus: () => void
}

type ConnectedProps = IProps & IStateProps & IDispatchProps

interface State {
    modified: boolean
    staged: boolean
    untracked: boolean
    commits: boolean
}

export class VersionControlView extends React.Component<ConnectedProps, State> {
    public state: State = {
        modified: true,
        staged: true,
        untracked: true,
        commits: true,
    }

    public async componentDidMount() {
        await this.props.getStatus()
    }

    public async componentDidCatch(e: Error) {
        this.props.setError(e)
    }

    public toggleVisibility = (section: keyof State) => {
        this.setState(prevState => ({ ...prevState, [section]: !prevState[section] }))
    }

    public toggleOrAction = (id: string) => {
        const isSectionId = Object.keys(this.state).includes(id)
        if (isSectionId) {
            this.toggleVisibility(id as keyof State)
        }
        this.props.handleSelection(id)
    }

    public formatCommit = (message: string) => {
        return message.length >= 50 ? [message.substr(0, 50), message.substr(50)] : [message]
    }

    public handleCommitMessage = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = evt.currentTarget
        const message = this.formatCommit(value)
        this.props.updateCommitMessage(message)
    }

    public handleCommitOne = async () => {
        const { message, selectedItem } = this.props
        await this.props.commit(message, [selectedItem])
    }

    public handleCommitAll = async () => {
        const { message } = this.props
        await this.props.commit(message)
    }

    public handleCommitCancel = () => {
        this.props.cancelCommit()
    }

    public insertIf(condition: boolean, element: string[]) {
        return condition ? element : []
    }

    public isSelected = (id: string) =>
        this.props.committing &&
        this.props.status.staged.length &&
        this.state.staged &&
        this.props.selectedItem === id

    public getIds = () => {
        const { logs, status, IDs } = this.props
        const { modified, staged, untracked } = status
        const commitSHAs = logs.all.slice(0, 1).map(({ hash }) => hash)
        const ids = [
            IDs.commits,
            ...this.insertIf(this.state.commits, commitSHAs),
            IDs.staged,
            ...this.insertIf(this.state.staged && !!staged.length, [IDs.commitAll]),
            ...this.insertIf(this.state.staged, staged),
            IDs.modified,
            ...this.insertIf(this.state.modified, modified),
            IDs.untracked,
            ...this.insertIf(this.state.untracked, untracked),
        ]
        return ids
    }

    public render() {
        const error = this.props.hasError && "Something Went Wrong!"
        const inactive = !this.props.activated && "Version Control Not Available"
        const warning = error || inactive
        const {
            IDs,
            logs,
            showHelp,
            loading,
            committing,
            filesToCommit,
            loadingSection,
            status: { modified, staged, untracked },
        } = this.props

        const commitInProgress = loading && loadingSection === "commit"

        return warning ? (
            <SectionTitle>
                <Title>{warning}</Title>
            </SectionTitle>
        ) : (
            <>
                {!showHelp ? <Title>To show help press "?"</Title> : <Help />}
                <VimNavigator
                    ids={this.getIds()}
                    active={this.props.hasFocus && !committing}
                    onSelected={this.toggleOrAction}
                    onSelectionChanged={this.props.updateSelection}
                    render={selectedId => (
                        <StatusContainer>
                            <CommitsSection
                                titleId={IDs.commits}
                                selectedId={selectedId}
                                visibility={this.state.commits}
                                onClick={this.props.handleSelection}
                                commits={logs.all}
                                toggleVisibility={() => this.toggleVisibility(IDs.commits)}
                            />
                            <StagedSection
                                titleId={IDs.staged}
                                icon="plus-circle"
                                files={staged}
                                selectedId={selectedId}
                                filesToCommit={filesToCommit}
                                selectedToCommit={this.isSelected}
                                visible={this.state.staged}
                                loading={commitInProgress}
                                handleSelection={this.props.handleSelection}
                                toggleVisibility={() => this.toggleVisibility(IDs.staged)}
                                handleCommitOne={this.handleCommitOne}
                                handleCommitAll={this.handleCommitAll}
                                handleCommitMessage={this.handleCommitMessage}
                                handleCommitCancel={this.handleCommitCancel}
                            />
                            <VersionControlStatus
                                icon="minus-circle"
                                files={modified}
                                titleId={IDs.modified}
                                selectedId={selectedId}
                                visibility={this.state.modified}
                                onClick={this.props.handleSelection}
                                toggleVisibility={() => this.toggleVisibility(IDs.modified)}
                            />
                            <VersionControlStatus
                                files={untracked}
                                icon="question-circle"
                                titleId={IDs.untracked}
                                selectedId={selectedId}
                                visibility={this.state.untracked}
                                onClick={this.props.handleSelection}
                                toggleVisibility={() => this.toggleVisibility(IDs.untracked)}
                            />
                        </StatusContainer>
                    )}
                />
            </>
        )
    }
}

const mapStateToProps = (state: VersionControlState): IStateProps => ({
    status: state.status,
    hasFocus: state.hasFocus,
    hasError: state.hasError,
    activated: state.activated,
    committing: state.commit.active,
    message: state.commit.message,
    selectedItem: state.selected,
    commits: state.commit.previousCommits,
    filesToCommit: state.commit.files,
    showHelp: state.help.active,
    loading: state.loading.active,
    loadingSection: state.loading.type,
    logs: state.logs,
})

const ConnectedGitComponent = connect<IStateProps, IDispatchProps, IProps>(
    mapStateToProps,
    VersionControlActions,
)(VersionControlView)

export default ConnectedGitComponent
