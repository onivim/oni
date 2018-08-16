import * as React from "react"

import styled, { Center, sidebarItemSelected, withProps } from "../common"
import { LoadingSpinner } from "./../../../UI/components/LoadingSpinner"
import CommitMessage from "./CommitMessage"
import File from "./File"
import SectionTitle from "./SectionTitle"

const Explainer = styled.div`
    width: 100%;
    text-align: left;
    display: block;
    opacity: 0.4;
    padding: 0.5rem;
`

interface IProps {
    files?: string[]
    titleId: string
    selectedId: string
    icon: string
    loading: boolean
    handleSelection: (id: string) => void
    filesToCommit: string[]
    toggleVisibility: () => void
    handleCommitMessage: (evt: React.ChangeEvent<HTMLInputElement>) => void
    handleCommitOne: () => void
    handleCommitCancel: () => void
    handleCommitAll: () => void
    selectedToCommit?: (id: string) => boolean
    visible: boolean
}

const OptionsBar = withProps<{ isSelected: boolean }>(styled.span)`
    ${p => p.isSelected && sidebarItemSelected};
    display: block;
    width: 100%;
`

export const LoadingHandler: React.SFC<{ loading: boolean }> = ({ loading, children }) => (
    <>
        {loading ? (
            <Center>
                <LoadingSpinner iconSize="0.4em" />
            </Center>
        ) : (
            children
        )}
    </>
)

const StagedSection: React.SFC<IProps> = props => {
    const commitAllSelected = "commit_all" === props.selectedId
    return (
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
                <LoadingHandler loading={props.loading && commitAllSelected}>
                    <OptionsBar isSelected={commitAllSelected}>
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
                    </OptionsBar>
                </LoadingHandler>
            ) : null}
            {props.visible &&
                props.files.map(file => {
                    const isSelected = file === props.selectedId
                    const isLoading = props.filesToCommit.includes(file) && props.loading
                    return (
                        <LoadingHandler loading={isLoading} key={file}>
                            {props.selectedToCommit(file) ? (
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
                                    isSelected={isSelected}
                                />
                            )}
                        </LoadingHandler>
                    )
                })}
        </div>
    )
}

export default StagedSection
