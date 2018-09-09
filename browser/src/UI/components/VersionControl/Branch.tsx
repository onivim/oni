import * as React from "react"

import { Diff } from "./../../../Services/VersionControl"
import styled from "./../../../UI/components/common"
import Octicon, { Icons } from "./../../../UI/components/Octicon"

type ChangeTypes = "change" | "addition" | "deletion"

interface ICreateIconArgs {
    type: ChangeTypes
    num: number
}

const BranchContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
`

const BranchText = styled.span`
    min-width: 10px;
    text-align: center;
    padding: 2px 4px 0 0;
    display: flex;
    align-items: center;
`

export const BranchNameContainer = styled.span`
    width: 100%;
    margin-left: 4px;
`

const ChangeSpanContainer = styled.span`
    font-size: 0.7rem;
    padding: 0 0.15rem;
`

const ChangeSpan = styled.span`
    padding-left: 0.25rem;
`

interface BranchProps {
    branch: string
    children?: React.ReactNode
    diff: Diff
}

export const Branch: React.SFC<BranchProps> = ({ diff, branch, children }) =>
    branch && (
        <BranchContainer>
            <BranchText>
                <Octicon name="git-branch" />
                <BranchNameContainer>
                    {`${branch} `}
                    {diff && (
                        <DeletionsAndInsertions
                            deletions={diff.deletions}
                            insertions={diff.insertions}
                        />
                    )}
                    {children}
                </BranchNameContainer>
            </BranchText>
        </BranchContainer>
    )

const getClassNameForType = (type: ChangeTypes): Icons => {
    switch (type) {
        case "addition":
            return "diff-added"
        case "deletion":
            return "diff-removed"
        case "change":
            return "diff-modified"
        default:
            return "diff-ignored"
    }
}

interface ChangesProps {
    deletions: number
    insertions: number
}

export const DeletionsAndInsertions: React.SFC<ChangesProps> = ({ deletions, insertions }) => (
    <span>
        <VCSIcon type="addition" num={insertions} />
        {!!(deletions && insertions) && <span key={2}>, </span>}
        <VCSIcon type="deletion" num={deletions} />
    </span>
)

export const VCSIcon: React.SFC<ICreateIconArgs> = ({ type, num }) =>
    !!num && (
        <span>
            <ChangeSpanContainer>
                <Octicon name={getClassNameForType(type)} />
            </ChangeSpanContainer>
            <ChangeSpan data-test={`${type}-${num}`}>{num}</ChangeSpan>
        </span>
    )
