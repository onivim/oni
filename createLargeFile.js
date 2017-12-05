const fs = require("fs")

const path = require("path")

const neovimInstanceFile = path.join(__dirname, "browser", "src", "neovim", "NeovimInstance.ts")

const outPath = path.join(__dirname, "largeTestFile.ts")

let contents = fs.readFileSync(neovimInstanceFile)

const iterations = 13

for (let i = 0; i < iterations; i++) {
    contents = contents + contents
}

fs.writeFileSync(outPath, contents)
