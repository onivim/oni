import * as path from "path"
import * as React from "react"
import { connect } from "react-redux"

import { styled, withProps } from "./../../UI/components/common"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { StatusResult } from "./VersionControlProvider"
import { IState } from "./VersionControlStore"

const Row = styled.div`
    display: flex;
    span >  {
        margin-right: 0.2em;
    }
`

const Column = withProps<{ isSelected: boolean }>(styled.div)`
    display: flex;
    flex-direction: column;
    border: ${p => p.isSelected && `1px solid ${p.theme["highlight.mode.normal.background"]}`};
    padding: 0.3em;
`

const Name = styled.span``

const Title = styled.h4`
    margin: 0;
`

export const SectionTitle = styled.div`
    margin: 0.2em 0;
    padding: 0.2em;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: space-between;
`

interface IModifiedFilesProps {
    files?: string[]
    title: string
    selectedId: string
    symbol: string
}

const truncate = (str: string) =>
    str
        .split(path.sep)
        .slice(-2)
        .join(path.sep)

export const GitStatus = ({ title, files, selectedId, symbol }: IModifiedFilesProps) => (
    <div>
        {files && (
            <div>
                <SectionTitle data-test={`${title}-${files.length}`}>
                    <Title>{title}</Title>
                    <strong>{files.length}</strong>
                </SectionTitle>
                {files.map(filePath => (
                    <Column key={filePath} isSelected={selectedId === filePath}>
                        <Name>{truncate(filePath)}</Name>
                        <Row>
                            <strong>{symbol}</strong>
                        </Row>
                    </Column>
                ))}
            </div>
        )}
    </div>
)

interface IProps {
    status: StatusResult
    hasFocus: boolean
    hasError: boolean
    setError?: (e: Error) => void
    getStatus?: () => void
    handleSelection?: (selection: string) => void
    children?: React.ReactNode
}

class VersionControlView extends React.Component<IProps> {
    public async componentDidMount() {
        await this.props.getStatus()
    }

    public async componentDidCatch(e: Error) {
        this.props.setError(e)
    }

    public render() {
        const { modified, staged, untracked } = this.props.status
        return this.props.hasError ? (
            <SectionTitle>
                <Title>Something Went Wrong</Title>
            </SectionTitle>
        ) : (
            <VimNavigator
                ids={[...modified, ...untracked, ...staged]}
                active={this.props.hasFocus}
                onSelected={this.props.handleSelection}
                render={selectedId => (
                    <div>
                        <GitStatus
                            selectedId={selectedId}
                            files={modified}
                            title="Modified Files"
                            symbol="M"
                        />
                        <GitStatus
                            selectedId={selectedId}
                            files={staged}
                            title="Staged Files"
                            symbol="S"
                        />
                        <GitStatus
                            selectedId={selectedId}
                            files={untracked}
                            title="Untracked Files"
                            symbol="?"
                        />
                    </div>
                )}
            />
        )
    }
}

export default connect<IState>(
    (state: IState): IProps => ({
        status: state.status,
        hasFocus: state.hasFocus,
        hasError: state.hasError,
    }),
    null,
)(VersionControlView)
