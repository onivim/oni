/**
 * Script for hero screenshot on Oni's website and github
 */

import * as path from "path"

import * as mkdirp from "mkdirp"

export const getRootPath = () => {
    return path.join(__dirname, "..", "..", "..")
}

export const getDistPath = () => {
    const distPath = path.join(getRootPath(), "dist", "media")
    mkdirp.sync(distPath)
    return distPath
}
