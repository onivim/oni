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
    toggleVisibility: () => void
    committing?: boolean
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
    toggleVisibility,
    titleId,
    visibility,
}) =>
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
            {visibility && !committing
                ? files.map(filePath => (
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
                  ))
                : children}
        </div>
    )

export default VersionControlStatus
