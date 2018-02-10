/**
 * Helper script to copy the packaged files to an 's3' folder
 * for upload to s3
 */

const path = require("path")
const fs = require("fs")
const mkdirp = require("mkdirp")

const rootPath = path.join(__dirname, "..", "..")
const distPath = path.join(rootPath, "dist")
const s3_distPath = path.join(rootPath, "s3_dist")

console.log(`Creating 's3_dist' folder at: ${s3_distPath}`)
mkdirp.sync(s3_distPath)

// Get all files in 'dist'..
const filesAndFolder = fs.readdirSync(distPath)

// And copy the files to `s3_dist`
filesAndFolder.forEach(f => {
    console.log("- Checking: " + f)

    const fullPath = path.join(distPath, f)
    const stat = fs.statSync(fullPath)

    if (stat.isFile()) {
        const destPath = path.join(s3_distPath, f)
        console.log(`-- Copying ${fullPath} to ${destPath}`)
        fs.copyFileSync(fullPath, destPath)
        console.log(`-- Copy successful`)
    }
})

console.log("CopyPackedFilesForS3Upload::Complete")
