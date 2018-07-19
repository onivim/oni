import * as React from "react"
import { connect } from "react-redux"

import { styled } from "./../../UI/components/common"
import TextInput from "./../../UI/components/LightweightText"
import CommitsSection from "./../../UI/components/VersionControl/Commits"
import { SectionTitle, Title } from "./../../UI/components/VersionControl/SectionTitle"
import VersionControlStatus from "./../../UI/components/VersionControl/Status"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { Commits, StatusResult } from "./VersionControlProvider"
import { VersionControlActions, VersionControlState } from "./VersionControlStore"

const TextArea = styled.textarea`
    width: 100%;
    background-color: inherit;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    padding: 0.5em;
    box-sizing: border-box;
    overflow: hidden;
    resize: vertical;
`

const StatusContainer = styled.div`
    overflow-x: hidden;
    overflow-y: auto;
`
const Explainer = styled.span`
    width: 100%;
    text-align: center;
    font-size: 0.8em;
    display: block;
    opacity: 0.4;
`

interface IStateProps {
    status: StatusResult
    hasFocus: boolean
    hasError: boolean
    activated: boolean
    committing: boolean
    message: string[]
    selectedItem: string
    commits: Commits[]
}

interface IDispatchProps {
    cancelCommit: () => void
    updateCommitMessage: (message: string[]) => void
}

interface IProps {
    setError?: (e: Error) => void
    getStatus?: () => Promise<StatusResult | void>
    commitFiles?: (message: string[], files: string[]) => Promise<void>
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
        if (id === "modified" || id === "staged" || id === "untracked" || id === "commits") {
            this.toggleVisibility(id)
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

    public handleCommitComplete = async () => {
        const { message, selectedItem } = this.props
        await this.props.commitFiles(message, [selectedItem])
    }

    public handleCommitCancel = () => {
        this.props.cancelCommit()
    }

    public insertIf(condition: boolean, element: string[]) {
        return condition ? element : []
    }

    public render() {
        const error = this.props.hasError && "Something Went Wrong!"
        const inactive = !this.props.activated && "Version Control Not Available"
        const warning = error || inactive
        const {
            commits,
            committing,
            status: { modified, staged, untracked },
        } = this.props

        const commitSHAs = commits.map(({ commit }) => commit)

        const ids = [
            "commits",
            ...this.insertIf(this.state.commits, commitSHAs),
            "staged",
            ...this.insertIf(this.state.staged, staged),
            "modified",
            ...this.insertIf(this.state.modified, modified),
            "untracked",
            ...this.insertIf(this.state.untracked, untracked),
        ]

        return warning ? (
            <SectionTitle>
                <Title>{warning}</Title>
            </SectionTitle>
        ) : (
            <VimNavigator
                ids={ids}
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
                        <VersionControlStatus
                            icon="plus-circle"
                            titleId="staged"
                            files={staged}
                            selectedId={selectedId}
                            committing={committing && this.state.staged}
                            visibility={this.state.staged}
                            onClick={this.props.handleSelection}
                            toggleVisibility={() => this.toggleVisibility("staged")}
                        >
                            {this.state.staged && (
                                <>
                                    <Explainer>Hit enter to commit the file</Explainer>
                                    <TextInput
                                        InputComponent={TextArea}
                                        onChange={this.handleCommitMessage}
                                        onCancel={this.handleCommitCancel}
                                        onComplete={this.handleCommitComplete}
                                        defaultValue="Enter a commit message"
                                    />
                                </>
                            )}
                        </VersionControlStatus>
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
})

const ConnectedGitComponent = connect<IStateProps, IDispatchProps, IProps>(
    mapStateToProps,
    VersionControlActions,
)(VersionControlView)

export default ConnectedGitComponent
