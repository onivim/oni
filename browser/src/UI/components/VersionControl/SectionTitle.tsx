import * as React from "react"

import Caret from "./../Caret"
import { sidebarItemSelected, styled, withProps } from "./../common"

export const Title = styled.h4`
    margin: 0;
`

export const SectionTitle = withProps<Partial<IProps>>(styled.div)`
    ${sidebarItemSelected};
    margin: 0.2em 0;
    padding: 0.2em;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: space-between;
`

interface IProps {
    active: boolean
    isSelected: boolean
    title: string
    onClick: () => void
    count?: number
    testId: string
}

const VCSSectionTitle: React.SFC<IProps> = props => (
    <SectionTitle isSelected={props.isSelected} data-test={props.testId} onClick={props.onClick}>
        <Caret active={props.active} />
        <Title>{props.title.toUpperCase()}</Title>
        <strong>{props.count}</strong>
    </SectionTitle>
)

export default VCSSectionTitle
