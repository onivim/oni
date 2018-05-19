import * as path from "path"
import * as React from "react"
import { connect } from "react-redux"

import Caret from "./../../UI/components/Caret"
import { css, styled, withProps } from "./../../UI/components/common"
import { Sneakable } from "./../../UI/components/Sneakable"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { StatusResult } from "./VersionControlProvider"
import { IState } from "./VersionControlStore"

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
    word-wrap: break-word;
`

const Title = styled.h4`
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
    symbol: string
    onClick: (id: string) => void
    toggleVisibility: () => void
    visibility: boolean
}

const truncate = (str: string) =>
    str
        .split(path.sep)
        .slice(-2)
        .join(path.sep)

export const GitStatus = ({
    files,
    selectedId,
    symbol,
    onClick,
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
            {visibility &&
                files.map(filePath => (
                    <Sneakable callback={() => onClick(filePath)} key={filePath}>
                        <Column
                            onClick={() => onClick(filePath)}
                            isSelected={selectedId === filePath}
                        >
                            <Name>{truncate(filePath)}</Name>
                            <Row>
                                <strong>{symbol}</strong>
                            </Row>
                        </Column>
                    </Sneakable>
                ))}
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
    getStatus?: () => Promise<StatusResult | void>
    handleSelection?: (selection: string) => void
    children?: React.ReactNode
}

interface State {
    modified: boolean
    staged: boolean
    untracked: boolean
}

class VersionControlView extends React.Component<IProps, State> {
    public state: State = {
        modified: true,
        staged: true,
        untracked: true,
    }

    public async componentDidMount() {
        await this.props.getStatus()
    }

    public async componentDidCatch(e: Error) {
        this.props.setError(e)
    }

    public toggleVisibility = (section: keyof State) => {
        this.setState(prevState => ({ [section]: !prevState[section] }))
    }

    public toggleOrAction = (id: string) => {
        if (id === "modified" || id === "staged" || id === "untracked") {
            this.toggleVisibility(id)
        }
        this.props.handleSelection(id)
    }

    public insertIf(condition: boolean, element: string[]) {
        return condition ? element : []
    }

    public render() {
        const error = this.props.hasError && "Something Went Wrong!"
        const inactive = !this.props.activated && "Version Control Not Available"
        const warning = error || inactive
        const { modified, staged, untracked } = this.props.status
        const ids = [
            "modified",
            ...this.insertIf(this.state.modified, modified),
            "staged",
            ...this.insertIf(this.state.staged, staged),
            "untracked",
            ...this.insertIf(this.state.untracked, untracked),
        ]

        return warning ? (
            <SectionTitle>
                <Title>{warning}</Title>
            </SectionTitle>
        ) : (
            <VimNavigator
                ids={ids}
                active={this.props.hasFocus}
                onSelected={this.toggleOrAction}
                render={selectedId => (
                    <StatusContainer>
                        <GitStatus
                            symbol="M"
                            files={modified}
                            titleId="modified"
                            selectedId={selectedId}
                            visibility={this.state.modified}
                            onClick={this.props.handleSelection}
                            toggleVisibility={() => this.toggleVisibility("modified")}
                        />
                        <GitStatus
                            symbol="S"
                            titleId="staged"
                            files={staged}
                            selectedId={selectedId}
                            visibility={this.state.staged}
                            onClick={this.props.handleSelection}
                            toggleVisibility={() => this.toggleVisibility("staged")}
                        />
                        <GitStatus
                            files={untracked}
                            symbol="?"
                            titleId="untracked"
                            selectedId={selectedId}
                            visibility={this.state.untracked}
                            onClick={this.props.handleSelection}
                            toggleVisibility={() => this.toggleVisibility("untracked")}
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
