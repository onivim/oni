/**
 * Helper script to validate the binaries we need for Oni.
 *
 * Because github throttles unauthenticated requests to download,
 * in some cases on the CI machines, we are unable to get the
 */

const path = require("path")
const fs = require("fs")
const mkdirp = require("mkdirp")
const fsExtra = require("fs-extra")

const rootPath = path.join(__dirname, "..", "..")
const cachePath = path.join(rootPath, ".oni_build_cache")

const modulesToCheck = ["oni-neovim-binaries", "oni-ripgrep"]

const isAuthenticated = !!process.env["GITHUB_TOKEN"]

const doBinFoldersExist = root => {
    const fullPaths = modulesToCheck.map(m => path.join(root, "node_modules", m, "bin"))

    let result = true

    fullPaths.forEach(fp => {
        console.log("- checking folder: " + fp)
        result = result && doesFolderExist(fp)
    })

    return result
}

const copyFolders = (srcRoot, destRoot) => {
    modulesToCheck.forEach(m => {
        const srcDirectory = path.join(srcRoot, "node_modules", m)
        const destDirectory = path.join(destRoot, "node_modules", m)
        console.log(`- Copying from ${srcDirectory} to ${destDirectory}`)
        fsExtra.copySync(srcDirectory, destDirectory)
    })
}

const doesFolderExist = folder => {
    return fs.existsSync(folder) && fs.statSync(folder).isDirectory()
}

console.log("Checking binaries for build...")
console.log("- isAuthenticated: " + isAuthenticated)

const foldersExist = doBinFoldersExist(rootPath)
const cacheFoldersExist = doBinFoldersExist(cachePath)

console.log("- doBinFoldersExist in root: " + foldersExist)
console.log("- doBinFoldersExist in cache: " + cacheFoldersExist)

if (isAuthenticated && doBinFoldersExist) {
    console.log("- Copying files to cache")
    copyFolders(rootPath, cachePath)
    console.log("- Copy complete")
} else if (!isAuthenticated && !doBinFoldersExist && cacheFoldersExist) {
    console.log("- Copying files from cache")
    copyFolders(cachePath, rootPath)
    console.log("- Copy complete!")
} else {
    console.log("Binary folders do not exist, cancelling build")
    process.exit(1)
}
