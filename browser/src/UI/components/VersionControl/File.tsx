import * as path from "path"
import * as React from "react"

import { Sneakable } from "../Sneakable"
import { Icon } from "./../../Icon"
import styled, { sidebarItemSelected, withProps } from "./../common"

interface IProps {
    onClick: (path: string) => void
    file: string
    icon: string
    isSelected: boolean
}

const Row = styled.div`
    display: flex;
    span > {
        margin-right: 0.2em;
    }
`

const truncate = (str: string) =>
    str
        .split(path.sep)
        .slice(-2)
        .join(path.sep)

interface SelectionProps {
    isSelected?: boolean
}

const Column = withProps<SelectionProps>(styled.div)`
    ${sidebarItemSelected};
    display: flex;
    flex-direction: column;
    padding: 0.3em;
`

const Name = styled.span`
    margin-left: 0.5em;
    word-wrap: break-word;
`

const File: React.SFC<IProps> = ({ file, icon, onClick, isSelected }) => (
    <Sneakable callback={() => onClick(file)} key={file}>
        <Column onClick={() => onClick(file)} isSelected={isSelected}>
            <Row>
                <Icon name={icon} />
                <Name>{truncate(file)}</Name>
            </Row>
        </Column>
    </Sneakable>
)

export default File
