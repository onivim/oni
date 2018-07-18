import * as os from "os"
import * as path from "path"
import * as React from "react"
import { connect } from "react-redux"

import { Icon } from "../../UI/Icon"
import Caret from "./../../UI/components/Caret"
import { css, styled, withProps } from "./../../UI/components/common"
import TextInput from "./../../UI/components/LightweightText"
import { Sneakable } from "./../../UI/components/Sneakable"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { StatusResult } from "./VersionControlProvider"
import { VersionControlActions, VersionControlState } from "./VersionControlStore"

const Row = styled.div`
    display: flex;
    span > {
        margin-right: 0.2em;
    }
`

interface SelectionProps {
    isSelected?: boolean
}

const selected = css`
    border: ${(p: any) =>
        p.isSelected && `1px solid ${p.theme["highlight.mode.normal.background"]}`};
`

const Column = withProps<SelectionProps>(styled.div)`
    ${selected};
    display: flex;
    flex-direction: column;
    padding: 0.3em;
`

const Name = styled.span`
    margin-left: 0.5em;
    word-wrap: break-word;
`

const Title = styled.h4`
    margin: 0;
`

export const SectionTitle = withProps<SelectionProps>(styled.div)`
    ${selected};
    margin: 0.2em 0;
    padding: 0.2em;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: space-between;
`

interface IModifiedFilesProps {
    files?: string[]
    titleId: string
    selectedId: string
    icon: string
    onClick: (id: string) => void
    toggleVisibility: () => void
    committing?: boolean
    handleCancel?: () => void
    handleComplete?: () => void
    handleChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void
    visibility: boolean
}

const truncate = (str: string) =>
    str
        .split(path.sep)
        .slice(-2)
        .join(path.sep)

const inputStyles = css`
    width: 100%;
    background-color: inherit;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    padding: 0.5em;
    box-sizing: border-box;
`

export const GitStatus = ({
    files,
    selectedId,
    icon,
    onClick,
    committing,
    handleCancel,
    handleChange,
    handleComplete,
    toggleVisibility,
    titleId,
    visibility,
}: IModifiedFilesProps) =>
    files && (
        <div>
            <SectionTitle
                isSelected={selectedId === titleId}
                data-test={`${titleId}-${files.length}`}
                onClick={toggleVisibility}
            >
                <Caret active={visibility && !!files.length} />
                <Title>{titleId.toUpperCase()}</Title>
                <strong>{files.length}</strong>
            </SectionTitle>
            {visibility && !committing ? (
                files.map(filePath => (
                    <Sneakable callback={() => onClick(filePath)} key={filePath}>
                        <Column
                            onClick={() => onClick(filePath)}
                            isSelected={selectedId === filePath}
                        >
                            <Row>
                                <Icon name={icon} />
                                <Name>{truncate(filePath)}</Name>
                            </Row>
                        </Column>
                    </Sneakable>
                ))
            ) : (
                <TextInput
                    styles={inputStyles}
                    onComplete={handleComplete}
                    onChange={handleChange}
                    onCancel={handleCancel}
                />
            )}
        </div>
    )

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
                        <GitStatus
                            icon="minus-circle"
                            files={modified}
                            titleId="modified"
                            selectedId={selectedId}
                            visibility={this.state.modified}
                            onClick={this.props.handleSelection}
                            toggleVisibility={() => this.toggleVisibility("modified")}
                        />
                        <GitStatus
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
                        <GitStatus
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
