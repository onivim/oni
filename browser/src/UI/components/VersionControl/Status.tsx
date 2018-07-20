import * as path from "path"
import * as React from "react"

import { Icon } from "./../../Icon"
import { sidebarItemSelected, styled, withProps } from "./../common"
import { Sneakable } from "./../Sneakable"
import VCSSectionTitle from "./SectionTitle"

const Row = styled.div`
    display: flex;
    span > {
        margin-right: 0.2em;
    }
`

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

interface IModifiedFilesProps {
    files?: string[]
    titleId: string
    selectedId: string
    icon: string
    onClick: (id: string) => void
    committing?: boolean
    toggleVisibility: () => void
    optionsBar?: JSX.Element
    selectedToCommit?: (id: string) => boolean
    visibility: boolean
}

const truncate = (str: string) =>
    str
        .split(path.sep)
        .slice(-2)
        .join(path.sep)

export const VersionControlStatus: React.SFC<IModifiedFilesProps> = ({
    files,
    selectedId,
    children,
    icon,
    onClick,
    committing,
    selectedToCommit,
    toggleVisibility,
    titleId,
    optionsBar,
    visibility,
}) => {
    return (
        files && (
            <div>
                <VCSSectionTitle
                    isSelected={selectedId === titleId}
                    testId={`${titleId}-${files.length}`}
                    onClick={toggleVisibility}
                    active={visibility && !!files.length}
                    title={titleId}
                    count={files.length}
                />
                {visibility && optionsBar}
                {visibility &&
                    files.map(
                        filePath =>
                            committing && selectedToCommit && !selectedToCommit(filePath) ? (
                                children
                            ) : (
                                <Sneakable callback={() => onClick(filePath)} key={filePath}>
                                    <Column
                                        onClick={() => onClick(filePath)}
                                        isSelected={selectedId === filePath}
                                    >
                                        <Row>
                                            <Icon name={icon} />
                                            <Name>{truncate(filePath)}</Name>
                                        </Row>
                                    </Column>
                                </Sneakable>
                            ),
                    )}
            </div>
        )
    )
}

export default VersionControlStatus
