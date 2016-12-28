const path = require("path")
const os = require("os")
const execSync = require("child_process").execSync

const isWindows = os.platform() === "win32"

const tslintExecutable = isWindows ? "tslint.cmd" : "tslint"

const tslintPath = path.join(__dirname, "..", "..", "..", "..", "node_modules", ".bin", tslintExecutable)

// TODO: Switch to save event
Oni.on("buffer-update", (args) => {
    if (!args.eventContext.bufferFullPath) {
        return
    }

    console.log("edited: " + args.eventContext.bufferFullPath)

    const args = ["--force", "--format json"]

    // TODO: If tsconfig.json is present, use that
    // TODO: If tslint.json is present, use that

    const derp = execSync(tslintPath + " --force --format json " + args.eventContext.bufferFullPath, { cwd: path.dirname(args.eventContext.bufferFullPath) }).toString()

    Oni.diagnostics.setErrors("tslint", args.eventContext.bufferFullPath, [{ type: null, text: "derp", lineNumber: 1, startColumn: 0, endColumn: 1}], "yellow")
})
