import * as React from "react"

import { Commits } from "./../../../Services/VersionControl/VersionControlProvider"
import { sidebarItemSelected, styled, withProps } from "./../../../UI/components/common"
import VCSSectionTitle from "./SectionTitle"

interface ICommitsSection {
    commits: Commits[]
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
const ListItem = withProps<{ isSelected?: boolean }>(styled.li)`
    ${({ isSelected }) => isSelected && sidebarItemSelected};
    padding: 0.4rem;
`

const CommitsSection: React.SFC<ICommitsSection> = ({ commits, ...props }) => {
    return (
        <div>
            <VCSSectionTitle
                isSelected={props.selectedId === props.titleId}
                testId={`${props.titleId}-${commits.length}`}
                onClick={props.toggleVisibility}
                active={props.visibility}
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
                            <p>
                                <strong> {prevCommit.message}</strong>
                            </p>
                            <p>{prevCommit.commit}</p>
                            <p>Deletions: {prevCommit.summary.deletions}</p>
                            <p>Insertions: {prevCommit.summary.insertions}</p>
                        </ListItem>
                    ))}
                </List>
            ) : null}
        </div>
    )
}

export default CommitsSection
