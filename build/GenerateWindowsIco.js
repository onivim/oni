// BuildSetupTemplate.js
//
// Helper script to insert template variables into the setup template

const path = require("path")
const fs = require("fs")

const buf = fs.readFileSync(path.join(__dirname, "..", "images", "oni.ico"))

fs.writeFileSync(path.join(__dirname, "icon.ico"), buf)
fs.writeFileSync(path.join(__dirname, "installerIcon.ico"), buf)
