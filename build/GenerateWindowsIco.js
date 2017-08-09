// BuildSetupTemplate.js
//
// Helper script to insert template variables into the setup template

const path = require("path")
const fs = require("fs")


const toIco = require("to-ico-sync")

const rootPath = path.join(__dirname, "icons")

const iconSizesToInclude = ["16x16", "32x32", "64x64", "256x256"]

const files = iconSizesToInclude.map((icon) => {
    fs.readFileSync(path.join(rootPath, icon, ".png"))
})

const buf = toIco(files)

fs.writeFileSync("favicon.ico", buf)
