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

const Name = styled.span`
    word-wrap: break-word;
`

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

const StatusContainer = styled.div`
    overflow-x: hidden;
    overflow-y: auto;
`

interface IProps {
    status: StatusResult
    hasFocus: boolean
    hasError: boolean
    activated: boolean
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
        const error = this.props.hasError && "Something Went Wrong!"
        const inactive = !this.props.activated && "Version Control Not Available"
        const warning = error || inactive
        return warning ? (
            <SectionTitle>
                <Title>{warning}</Title>
            </SectionTitle>
        ) : (
            <VimNavigator
                ids={[...modified, ...untracked, ...staged]}
                active={this.props.hasFocus}
                onSelected={this.props.handleSelection}
                render={selectedId => (
                    <StatusContainer>
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
                    </StatusContainer>
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
        activated: state.activated,
    }),
    null,
)(VersionControlView)
