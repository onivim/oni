import * as os from "os"
import * as React from "react"
import { connect } from "react-redux"

import { styled } from "./../../UI/components/common"
import VersionControlStatus, {
    SectionTitle,
    Title,
} from "./../../UI/components/VersionControlStatus"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { StatusResult } from "./VersionControlProvider"
import { VersionControlActions, VersionControlState } from "./VersionControlStore"

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
}

export class VersionControlView extends React.Component<ConnectedProps, State> {
    public state: State = {
        modified: true,
        staged: true,
        untracked: true,
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
        if (id === "modified" || id === "staged" || id === "untracked") {
            this.toggleVisibility(id)
        }
        this.props.handleSelection(id)
    }

    public handleCommitMessage = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = evt.currentTarget
        const message = value.split(os.EOL)
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
            committing,
            status: { modified, staged, untracked },
        } = this.props

        const ids = [
            "modified",
            ...this.insertIf(this.state.modified, modified),
            "staged",
            ...this.insertIf(this.state.staged, staged),
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
                            icon="plus-circle"
                            titleId="staged"
                            files={staged}
                            selectedId={selectedId}
                            committing={committing}
                            handleChange={this.handleCommitMessage}
                            handleCancel={this.handleCommitCancel}
                            handleComplete={this.handleCommitComplete}
                            visibility={this.state.staged}
                            onClick={this.props.handleSelection}
                            toggleVisibility={() => this.toggleVisibility("staged")}
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
})

const ConnectedGitComponent = connect<IStateProps, IDispatchProps, IProps>(
    mapStateToProps,
    VersionControlActions,
)(VersionControlView)

export default ConnectedGitComponent
