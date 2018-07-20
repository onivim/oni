import * as React from "react"

import { SectionTitle, Title } from "./SectionTitle"

const commands = [
    {
        key: "ctrl-r",
        explanation: "Refresh the VCS Pane",
    },
    {
        key: "e",
        explanation: "Open the selected file",
    },
]

const Help: React.SFC<{ showHelp: boolean }> = ({ showHelp }) =>
    showHelp && (
        <div>
            <SectionTitle>
                <Title>Help</Title>?
            </SectionTitle>
            {commands.map(command => (
                <div>
                    <p>
                        <span>{command.key}</span> <span>{command.explanation}</span>
                    </p>
                </div>
            ))}
        </div>
    )

export default Help
