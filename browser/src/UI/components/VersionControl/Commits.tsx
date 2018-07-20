import * as React from "react"

import { PrevCommits } from "./../../../Services/VersionControl/VersionControlStore"
import { sidebarItemSelected, styled, withProps } from "./../../../UI/components/common"
import VCSSectionTitle from "./SectionTitle"

interface ICommitsSection {
    commits: PrevCommits[]
    selectedId: string
    titleId: string
    visibility: boolean
    toggleVisibility: () => void
    onClick: (c: string) => void
}

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`
export const ListItem = withProps<{ isSelected?: boolean }>(styled.li)`
    ${({ isSelected }) => isSelected && sidebarItemSelected};
    padding: 0.4rem;
`

const Detail = styled.p`
    margin: 0.4 0;
`

const CommitsSection: React.SFC<ICommitsSection> = ({ commits, ...props }) => {
    return (
        <div>
            <VCSSectionTitle
                isSelected={props.selectedId === props.titleId}
                testId={`${props.titleId}-${commits.length}`}
                onClick={props.toggleVisibility}
                active={!!(props.visibility && commits.length)}
                title="Recent Commits"
                count={commits.length}
            />
            {props.visibility && commits.length ? (
                <List>
                    {commits.map(prevCommit => (
                        <ListItem
                            key={prevCommit.commit}
                            onClick={() => props.onClick(prevCommit.commit)}
                            isSelected={props.selectedId === prevCommit.commit}
                        >
                            <Detail>
                                <strong> {prevCommit.message}</strong>
                            </Detail>
                            <Detail>{prevCommit.commit}</Detail>
                            <Detail>Deletions: {prevCommit.summary.deletions}</Detail>
                            <Detail>Insertions: {prevCommit.summary.insertions}</Detail>
                        </ListItem>
                    ))}
                </List>
            ) : null}
        </div>
    )
}

export default CommitsSection
