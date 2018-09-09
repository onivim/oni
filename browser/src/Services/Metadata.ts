/**
 * Metadata.ts
 *
 * Provides information about Oni's pkg
 */

import { readFile } from "fs-extra"
import * as Log from "oni-core-logging"
import * as os from "os"
import * as path from "path"

export interface IMetadata {
    name: string
    version: string
}

export const getMetadata = async (): Promise<IMetadata> => {
    const packageMetadata = path.join(__dirname, "package.json")
    try {
        const data = await readFile(packageMetadata, "utf8")
        const pkg = JSON.parse(data)
        const metadata = { name: pkg.name, version: pkg.version }
        return metadata
    } catch (e) {
        Log.warn(`Oni Error: failed to fetch Oni package metadata because ${e.message}`)
        return { name: null, version: null }
    }
}

export const showAboutMessage = async () => {
    const metadata = await getMetadata()

    const infoLines = [
        `${metadata.name} version ${metadata.version}`,
        "https://www.onivim.io",
        "",
        "Copyright 2018 Bryan Phelps",
        "MIT License",
    ]

    alert(infoLines.join(os.EOL))
}
