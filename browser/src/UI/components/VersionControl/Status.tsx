import * as React from "react"

import File from "./File"
import VCSSectionTitle from "./../SectionTitle"

interface IModifiedFilesProps {
    files?: string[]
    titleId: string
    selectedId: string
    icon: string
    onClick: (id: string) => void
    toggleVisibility: () => void
    visibility: boolean
}

export const VersionControlStatus: React.SFC<IModifiedFilesProps> = ({
    files,
    selectedId,
    children,
    icon,
    onClick,
    toggleVisibility,
    titleId,
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
                {visibility &&
                    files.map(file => (
                        <File
                            icon={icon}
                            key={file}
                            file={file}
                            onClick={onClick}
                            isSelected={selectedId === file}
                        />
                    ))}
            </div>
        )
    )
}

export default VersionControlStatus
