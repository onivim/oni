import * as React from "react"
import Octicon, { getIconByName, iconsByName } from "@githubprimer/octicons-react"

export type Icons = keyof iconsByName

interface IProps {
    name: Icons
    props?: {}
}

export default function OcticonByName({ name, ...props }: IProps) {
    return <Octicon {...props} icon={getIconByName(name)} />
}
