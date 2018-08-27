import * as React from "react"

import { Logs } from "../../../Services/VersionControl/VersionControlProvider"
import { sidebarItemSelected, styled, withProps } from "./../../../UI/components/common"
import { formatDate } from "./../../../Utility"
import VCSSectionTitle from "./../SectionTitle"

interface ICommitsSection {
    commits: Logs["all"]
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
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 30em;
`
export const ListItem = withProps<{ isSelected?: boolean }>(styled.li)`
    ${({ isSelected }) => isSelected && sidebarItemSelected};
    padding: 0.4rem;
`

const Detail = styled.p`
    margin: 0.4rem 0;
`

const Container = styled.div`
    width: 100%;
    max-height: 20em;
    overflow: hidden;
`

const CommitsSection: React.SFC<ICommitsSection> = ({ commits, ...props }) => {
    return (
        <Container>
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
                            key={prevCommit.hash}
                            onClick={() => props.onClick(prevCommit.hash)}
                            isSelected={props.selectedId === prevCommit.hash}
                        >
                            <Detail>
                                <strong> {prevCommit.message}</strong>
                            </Detail>
                            <Detail>{prevCommit.hash.slice(0, 6)}</Detail>
                            <Detail>{formatDate(prevCommit.date)}</Detail>
                            <Detail>{prevCommit.author_email}</Detail>
                            <Detail>{prevCommit.author_name}</Detail>
                        </ListItem>
                    ))}
                </List>
            ) : null}
        </Container>
    )
}

export default CommitsSection
