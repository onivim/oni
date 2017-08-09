// BuildSetupTemplate.js
//
// Helper script to insert template variables into the setup template

const path = require("path")
const fs = require("fs")

const toIco = require("to-ico-sync")

const rootPath = path.join(__dirname, "icons")

const iconSizesToInclude = ["32x32", "64x64", "128x128", "256x256"]

const files = iconSizesToInclude.map((icon) => {
    const fileFullPath = path.join(rootPath, icon + ".png")
    console.log("Reading file: " + fileFullPath)
    return fs.readFileSync(fileFullPath)
})

const buf = toIco(files)

fs.writeFileSync(path.join(__dirname, "icon.ico"), buf)
fs.writeFileSync(path.join(__dirname, "installerIcon.ico"), buf)
fs.writeFileSync(path.join(__dirname, "..", "images", "oni.ico"), buf)
