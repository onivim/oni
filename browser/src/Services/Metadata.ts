/**
 * Metadata.ts
 *
 * Provides information about Oni's pkg
 */

import * as path from "path"
import * as fs from "fs"

export interface IMetadata {
    version: string
}

export const getMetadata = async (): Promise<IMetadata> => {
    const packageMetadata = path.join(__dirname, "pkg.json")

    return new Promise<IMetadata>((resolve, reject) => {
        fs.readFile(packageMetadata, "utf8", (err: NodeJS.ErrnoException, data: string) => {

            if (err) {
                reject(err)
                return
            }

            const pkg = JSON.parse(data)

            const metadata = {
                version: pkg.version,
            }

            resolve(metadata)
        })
    })
}
