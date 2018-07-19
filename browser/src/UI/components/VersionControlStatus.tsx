import * as path from "path"
import * as React from "react"

import { Icon } from "./../Icon"
import Caret from "./Caret"
import { css, styled, withProps } from "./common"
import TextInput from "./LightweightText"
import { Sneakable } from "./Sneakable"

const Row = styled.div`
    display: flex;
    span > {
        margin-right: 0.2em;
    }
`

interface SelectionProps {
    isSelected?: boolean
}

const selected = css`
    border: ${(p: any) =>
        p.isSelected && `1px solid ${p.theme["highlight.mode.normal.background"]}`};
`

const Column = withProps<SelectionProps>(styled.div)`
    ${selected};
    display: flex;
    flex-direction: column;
    padding: 0.3em;
`

const Name = styled.span`
    margin-left: 0.5em;
    word-wrap: break-word;
`

export const Title = styled.h4`
    margin: 0;
`

export const SectionTitle = withProps<SelectionProps>(styled.div)`
    ${selected};
    margin: 0.2em 0;
    padding: 0.2em;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: space-between;
`

interface IModifiedFilesProps {
    files?: string[]
    titleId: string
    selectedId: string
    icon: string
    onClick: (id: string) => void
    toggleVisibility: () => void
    committing?: boolean
    handleCancel?: () => void
    handleComplete?: () => void
    handleChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void
    visibility: boolean
}

const truncate = (str: string) =>
    str
        .split(path.sep)
        .slice(-2)
        .join(path.sep)

const inputStyles = css`
    width: 100%;
    background-color: inherit;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    padding: 0.5em;
    box-sizing: border-box;
`

export const VersionControlStatus = ({
    files,
    selectedId,
    icon,
    onClick,
    committing,
    handleCancel,
    handleChange,
    handleComplete,
    toggleVisibility,
    titleId,
    visibility,
}: IModifiedFilesProps) =>
    files && (
        <div>
            <SectionTitle
                isSelected={selectedId === titleId}
                data-test={`${titleId}-${files.length}`}
                onClick={toggleVisibility}
            >
                <Caret active={visibility && !!files.length} />
                <Title>{titleId.toUpperCase()}</Title>
                <strong>{files.length}</strong>
            </SectionTitle>
            {visibility && !committing ? (
                files.map(filePath => (
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
            ) : (
                <TextInput
                    styles={inputStyles}
                    onComplete={handleComplete}
                    onChange={handleChange}
                    onCancel={handleCancel}
                />
            )}
        </div>
    )

export default VersionControlStatus
