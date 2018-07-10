/**
 * Metadata.ts
 *
 * Provides information about Oni's pkg
 */

import * as fs from "fs"
import * as os from "os"
import * as path from "path"

export interface IMetadata {
    name: string
    version: string
}

export const getMetadata = async (): Promise<IMetadata> => {
    const packageMetadata = path.join(__dirname, "package.json")

    return new Promise<IMetadata>((resolve, reject) => {
        fs.readFile(packageMetadata, "utf8", (err: NodeJS.ErrnoException, data: string) => {
            if (err) {
                reject(err)
                return
            }

            const pkg = JSON.parse(data)

            const metadata = {
                name: pkg.name,
                version: pkg.version,
            }

            resolve(metadata)
        })
    })
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
