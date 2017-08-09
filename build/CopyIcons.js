// CopyIcons.js
//
// The windows packager requires an `icon.ico` and `installerIcon.ico`,
// this script reuses the one we use for oni's menu bar.

const path = require("path")
const fs = require("fs")

const buf = fs.readFileSync(path.join(__dirname, "..", "images", "oni.ico"))

fs.writeFileSync(path.join(__dirname, "icon.ico"), buf)
fs.writeFileSync(path.join(__dirname, "installerIcon.ico"), buf)
