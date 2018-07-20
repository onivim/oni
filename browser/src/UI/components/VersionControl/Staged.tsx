import * as React from "react"

import styled, { sidebarItemSelected, withProps } from "../common"
import CommitMessage, { Explainer } from "./CommitMessage"
import File from "./File"
import SectionTitle from "./SectionTitle"

interface IProps {
    files?: string[]
    titleId: string
    selectedId: string
    icon: string
    handleSelection: (id: string) => void
    committing?: boolean
    toggleVisibility: () => void
    handleCommitMessage: (evt: React.ChangeEvent<HTMLInputElement>) => void
    handleCommitOne: () => void
    handleCommitCancel: () => void
    handleCommitAll: () => void
    optionsBar?: JSX.Element
    selectedToCommit?: (id: string) => boolean
    visible: boolean
}

const OptionsBar = withProps<{ isSelected: boolean }>(styled.span)`
    ${p => p.isSelected && sidebarItemSelected};
    display: block;
    width: 100%;
    font-size: 0.8em;
`

interface IOptionProps {
    isSelected: boolean
}

const Options: React.SFC<IOptionProps> = ({ isSelected, children }) => {
    return <OptionsBar isSelected={isSelected}>{children}</OptionsBar>
}

const StagedSection: React.SFC<IProps> = props => (
    <div>
        <SectionTitle
            isSelected={props.selectedId === props.titleId}
            testId={`${props.titleId}-${props.files.length}`}
            onClick={props.toggleVisibility}
            active={props.visible && !!props.files.length}
            title={props.titleId}
            count={props.files.length}
        />
        {props.visible && props.files.length ? (
            <Options isSelected={"commit_all" === props.selectedId}>
                {props.selectedToCommit("commit_all") ? (
                    <CommitMessage
                        handleCommitCancel={props.handleCommitCancel}
                        handleCommitComplete={props.handleCommitAll}
                        handleCommitMessage={props.handleCommitMessage}
                    />
                ) : (
                    <Explainer onClick={() => props.handleSelection(props.titleId)}>
                        commit all ({props.files.length})
                    </Explainer>
                )}
            </Options>
        ) : null}
        {props.visible &&
            props.files.map(
                file =>
                    props.committing && props.selectedToCommit && !props.selectedToCommit(file) ? (
                        <CommitMessage
                            handleCommitCancel={props.handleCommitCancel}
                            handleCommitComplete={props.handleCommitOne}
                            handleCommitMessage={props.handleCommitMessage}
                        />
                    ) : (
                        <File
                            file={file}
                            icon={props.icon}
                            onClick={props.handleSelection}
                            isSelected={props.selectedId === file}
                        />
                    ),
            )}
    </div>
)

export default StagedSection
