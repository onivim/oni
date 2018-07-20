import * as React from "react"
import { connect } from "react-redux"

import { styled } from "./../../UI/components/common"
import CommitsSection from "./../../UI/components/VersionControl/Commits"
import Help from "./../../UI/components/VersionControl/Help"
import { SectionTitle, Title } from "./../../UI/components/VersionControl/SectionTitle"
import StagedSection from "./../../UI/components/VersionControl/Staged"
import VersionControlStatus from "./../../UI/components/VersionControl/Status"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { StatusResult } from "./VersionControlProvider"
import { PrevCommits, VersionControlActions, VersionControlState } from "./VersionControlStore"

const StatusContainer = styled.div`
    overflow-x: hidden;
    overflow-y: auto;
`

interface IStateProps {
    status: StatusResult
    hasFocus: boolean
    hasError: boolean
    activated: boolean
    committing: boolean
    message: string[]
    selectedItem: string
    commits: PrevCommits[]
    showHelp: boolean
}

interface IDispatchProps {
    cancelCommit: () => void
    updateCommitMessage: (message: string[]) => void
}

interface IProps {
    setError?: (e: Error) => void
    getStatus?: () => Promise<StatusResult | void>
    commitOne?: (message: string[], files: string[]) => Promise<void>
    commitAll?: (message: string[]) => Promise<void>
    updateSelection?: (selection: string) => void
    handleSelection?: (selection: string) => void
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
        await this.props.commitOne(message, [selectedItem])
    }

    public handleCommitAll = async () => {
        const { message } = this.props
        await this.props.commitAll(message)
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
        const { commits, status } = this.props
        const { modified, staged, untracked } = status
        const commitSHAs = commits.map(({ commit }) => commit)
        const ids = [
            "commits",
            ...this.insertIf(this.state.commits, commitSHAs),
            "staged",
            ...this.insertIf(!!staged.length, ["commit_all"]),
            ...this.insertIf(this.state.staged, staged),
            "modified",
            ...this.insertIf(this.state.modified, modified),
            "untracked",
            ...this.insertIf(this.state.untracked, untracked),
        ]
        return ids
    }

    public render() {
        const error = this.props.hasError && "Something Went Wrong!"
        const inactive = !this.props.activated && "Version Control Not Available"
        const warning = error || inactive
        const {
            commits,
            showHelp,
            committing,
            status: { modified, staged, untracked },
        } = this.props

        return warning ? (
            <SectionTitle>
                <Title>{warning}</Title>
            </SectionTitle>
        ) : (
            <>
                <Help showHelp={showHelp} />
                <VimNavigator
                    ids={this.getIds()}
                    active={this.props.hasFocus && !committing}
                    onSelected={this.toggleOrAction}
                    onSelectionChanged={this.props.updateSelection}
                    render={selectedId => (
                        <StatusContainer>
                            <CommitsSection
                                titleId="commits"
                                commits={commits}
                                selectedId={selectedId}
                                visibility={this.state.commits}
                                onClick={this.props.handleSelection}
                                toggleVisibility={() => this.toggleVisibility("commits")}
                            />
                            <StagedSection
                                titleId="staged"
                                icon="plus-circle"
                                files={staged}
                                selectedId={selectedId}
                                committing={committing}
                                selectedToCommit={this.isSelected}
                                visible={this.state.staged}
                                handleSelection={this.props.handleSelection}
                                toggleVisibility={() => this.toggleVisibility("staged")}
                                handleCommitOne={this.handleCommitOne}
                                handleCommitAll={this.handleCommitAll}
                                handleCommitMessage={this.handleCommitMessage}
                                handleCommitCancel={this.handleCommitCancel}
                            />
                            <VersionControlStatus
                                icon="minus-circle"
                                files={modified}
                                titleId="modified"
                                selectedId={selectedId}
                                visibility={this.state.modified}
                                onClick={this.props.handleSelection}
                                toggleVisibility={() => this.toggleVisibility("modified")}
                            />
                            <VersionControlStatus
                                files={untracked}
                                icon="question-circle"
                                titleId="untracked"
                                selectedId={selectedId}
                                visibility={this.state.untracked}
                                onClick={this.props.handleSelection}
                                toggleVisibility={() => this.toggleVisibility("untracked")}
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
    showHelp: state.help.active,
})

const ConnectedGitComponent = connect<IStateProps, IDispatchProps, IProps>(
    mapStateToProps,
    VersionControlActions,
)(VersionControlView)

export default ConnectedGitComponent
