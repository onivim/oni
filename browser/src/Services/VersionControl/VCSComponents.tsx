import * as React from "react"

import styled, { withProps } from "./../../UI/components/common"
import { Icon } from "./../../UI/Icon"

interface ICreateIconArgs {
    type: string
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
`

const BranchNameContainer = styled.span`
    width: 100%;
    margin-left: 4px;
`

const ChangeSpanContainer = withProps<{ type: string }>(styled.span)`
    font-size: "0.7rem";
    padding: "0 0.15rem";
    color: ${({ type }) => (type === "plus" ? "green" : "red")};
`

const ChangeSpan = styled.span`
    padding-left: 0.25rem;
`

export const Branch = (props: { branch: string; children: React.ReactNode }) => (
    <BranchContainer>
        <BranchText>
            <Icon name="code-fork" />
            <BranchNameContainer>
                {`${props.branch} `} {props.children}
            </BranchNameContainer>
        </BranchText>
    </BranchContainer>
)

export const VCSIcon = ({ type, num }: ICreateIconArgs) => (
    <span>
        <ChangeSpanContainer type={type}>
            <Icon name={`${type}-circle`} />
        </ChangeSpanContainer>
        <ChangeSpan>{num}</ChangeSpan>
    </span>
)
