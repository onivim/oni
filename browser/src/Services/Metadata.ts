/**
 * Metadata.ts
 *
 * Provides information about Oni's pkg
 */

import * as path from "path"
import * as fs from "fs"

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
    alert(`${metadata.name} ${metadata.version}`)
}
