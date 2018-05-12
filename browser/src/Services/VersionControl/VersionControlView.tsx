import * as React from "react"
import { connect } from "react-redux"

import { styled, withProps } from "./../../UI/components/common"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { VCSIcon } from "./VersionControlComponents"
import { IState, ModifiedFile } from "./VersionControlStore"

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
    max-width: 8em;
    white-space: nowrap;
    text-overflow: ellipses;
`

const Title = styled.h4`
    margin: 0;
`

const SectionTitle = styled.div`
    margin: 0.2em 0;
    padding: 0.2em;
    background-color: rgb(0, 0, 0);
    opacity: 0.2;
    display: flex;
    justify-content: space-between;
`

interface IModifiedFilesProps {
    files?: ModifiedFile[]
    selectedId: string
}

const ModifiedFiles = ({ files, selectedId }: IModifiedFilesProps) => (
    <div>
        <SectionTitle>
            <Title>Modified Files</Title>
            <strong>{files.length}</strong>
        </SectionTitle>
        {files &&
            files.map(({ changes, deletions, file }) => (
                <Column key={file} isSelected={selectedId === file}>
                    <Name>{file}</Name>
                    <Row>
                        {changes && <VCSIcon type="change" num={changes} />}
                        {deletions && <VCSIcon type="deletion" num={deletions} />}
                    </Row>
                </Column>
            ))}
    </div>
)

interface IProps {
    files: ModifiedFile[]
    hasFocus: boolean
    getStatus?: () => void
    handleSelection?: (selection: string) => void
    children?: React.ReactNode
}

class VersionControlContainer extends React.Component<IProps> {
    public async componentDidMount() {
        await this.props.getStatus()
    }

    public render() {
        const names = this.props.files.map(f => f.file)
        return (
            <VimNavigator
                ids={names}
                active={this.props.hasFocus}
                onSelected={this.props.handleSelection}
                render={selectedId => (
                    <ModifiedFiles selectedId={selectedId} files={this.props.files} />
                )}
            />
        )
    }
}

export default connect<IState>(
    (state): IProps => ({
        files: state.files,
        hasFocus: state.hasFocus,
    }),
    null,
)(VersionControlContainer)
