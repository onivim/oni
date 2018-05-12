import * as React from "react"

import styled, { IThemeColors, withProps } from "./../../UI/components/common"
import { Icon } from "./../../UI/Icon"

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
`

const BranchNameContainer = styled.span`
    width: 100%;
    margin-left: 4px;
`

const selectColorByType = (type: ChangeTypes, theme: IThemeColors) => {
    switch (type) {
        // case "addition":
        //     return theme["highlight.mode.insert.background"]
        // case "deletion":
        //     return "#ff6961"
        // case "change":
        //     return theme["highlight.mode.operator.foreground"]
        default:
            return ""
    }
}

const ChangeSpanContainer = withProps<{ type: ChangeTypes }>(styled.span)`
    font-size: 0.7rem;
    padding: 0 0.15rem;
    color: ${({ type, theme }) => selectColorByType(type, theme)};
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

const getClassNameForType = (type: ChangeTypes) => {
    switch (type) {
        case "addition":
            return "plus-circle"
        case "deletion":
            return "minus-circle"
        case "change":
        default:
            return "question-circle"
    }
}

export const VCSIcon = ({ type, num }: ICreateIconArgs) => (
    <span>
        <ChangeSpanContainer type={type}>
            <Icon name={getClassNameForType(type)} />
        </ChangeSpanContainer>
        <ChangeSpan>{num}</ChangeSpan>
    </span>
)
