import * as path from "path"
import * as React from "react"

import styled, { getSelectedBorder } from "./../common"
import Octicon, { Icons } from "./../Octicon"
import { Sneakable } from "./../Sneakable"

interface IProps {
    onClick: (path: string) => void
    file: string
    icon: Icons
    isSelected: boolean
}

const Row = styled.div`
    border: ${getSelectedBorder};
    display: flex;
    padding: 0.3em;
`

const truncate = (str: string) =>
    str
        .split(path.sep)
        .slice(-2)
        .join(path.sep)

const Name = styled.span`
    word-wrap: break-word;
`

const IconContainer = styled.div`
    margin-right: 0.5rem;
`

const File: React.SFC<IProps> = ({ file, icon, onClick, isSelected }) => (
    <Sneakable callback={() => onClick(file)} key={file}>
        <Row onClick={() => onClick(file)} isSelected={isSelected}>
            <IconContainer>
                <Octicon name={icon} />
            </IconContainer>
            <Name>{truncate(file)}</Name>
        </Row>
    </Sneakable>
)

export default File
