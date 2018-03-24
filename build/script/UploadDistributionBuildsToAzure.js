const azure = require("azure-storage")
const util = require("util")
const path = require("path")
const fs = require("fs")
const os = require("os")

const AZURE_STORAGE_NAME = process.env["AZURE_STORAGE_NAME"]
const AZURE_STORAGE_KEY = process.env["AZURE_STORAGE_KEY"]

const COMMIT_ID = process.env["TRAVIS_COMMIT"] || process.env["APPVEYOR_REPO_COMMIT"]

if (!COMMIT_ID || !AZURE_STORAGE_NAME || !AZURE_STORAGE_KEY) {
    console.log("Skipping upload since this is a PR")
    process.exit(0)
}

const blobService = azure.createBlobService(AZURE_STORAGE_NAME, AZURE_STORAGE_KEY)

const getBranch = () => process.env["APPVEYOR_REPO_BRANCH"] || process.env["TRAVIS_BRANCH"]

const branchName = getBranch()

if (branchName !== "master") {
    console.log("Skipping upload since this is not the master branch")
    process.exit(0)
}

const getDistFolder = () => path.join(__dirname, "..", "..", "dist")

const getVersion = () => {
    const packageJsonPath = path.join(getDistFolder(), "..", "package.json")
    const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath))
    const version = packageInfo.version
    return version
}

const getBuildsForWindows = version => {
    switch (process.env["PLATFORM"]) {
        case "x86":
            return [`Oni-${version}-ia32-win.exe`, `Oni-${version}-ia32-win.zip`]
        case "x64":
            return [`Oni-${version}-win.exe`, `Oni-${version}-win.zip`]
        default:
            return []
    }
}

const getBuildsForPlatform = version => {
    const platform = os.platform()

    switch (platform) {
        case "win32":
            return getBuildsForWindows(version)
        case "darwin":
            return [`Oni-${version}-osx.dmg`]
        case "linux":
            return [
                `Oni-${version}-amd64-linux.deb`,
                `Oni-${version}-x86_64-linux.rpm`,
                `Oni-${version}-x64-linux.tar.gz`,
            ]
        default:
            return []
    }
}

const createContainerIfNotExists = containerName => {
    return new Promise((resolve, reject) => {
        blobService.createContainerIfNotExists(containerName, (err1, res1, response1) => {
            if (err1) {
                reject(err)
                return
            }

            resolve(res1)
        })
    })
}

const createBlockBlobFromFile = (containerName, blobName, filePath) => {
    console.log(
        `Uploading file - containerName: ${containerName} blobName: ${blobName} filePath: ${filePath}`,
    )

    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromLocalFile(
            containerName,
            blobName,
            filePath,
            (err, result) => {
                console.log("createBlockBlobFromLocalFile complete")
                if (err) {
                    reject(err)
                    return
                }

                resolve(result)
            },
        )
    })
}

const start = async () => {
    console.log("Creating download meta container...")
    await createContainerIfNotExists("downloadmeta")

    console.log("Creating container for commit: " + COMMIT_ID)
    await createContainerIfNotExists(COMMIT_ID)

    const version = getVersion()
    console.log("Version: " + version)

    const builds = getBuildsForPlatform(version)

    const distFolder = getDistFolder()
    console.log("Dist folder: " + distFolder)

    const allPromises = builds.map(build => {
        console.log("Uploading build: " + build)
        return createBlockBlobFromFile(COMMIT_ID, build, path.join(distFolder, build))
    })

    await Promise.all([allPromises])
}

start()
