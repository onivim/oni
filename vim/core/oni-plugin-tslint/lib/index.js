const path = require("path")
const os = require("os")
const execSync = require("child_process").execSync

const findParentDir = require("find-parent-dir")

const isWindows = os.platform() === "win32"

const tslintExecutable = isWindows ? "tslint.cmd" : "tslint"

const tslintPath = path.join(__dirname, "..", "..", "..", "..", "node_modules", ".bin", tslintExecutable)

const doLint = (args) => {
    if (!args.bufferFullPath) {
        return
    }

    const currentWorkingDirectory = path.dirname(args.bufferFullPath)

    const tslint = findParentDir.sync(currentWorkingDirectory, "tslint.json")

    if (!tslint) {
        console.warn("No tslint.json found; not running tslint.")
        return
    }

    const processArgs = ["--force", "--format json"]
    processArgs.push("--config", path.join(tslint, "tslint.json"))

    console.log("edited: " + args.bufferFullPath)

    const project = findParentDir.sync(currentWorkingDirectory, "tsconfig.json")

    if (project) {
        processArgs.push("--project", path.join(project, "tsconfig.json"))
    } else {
        processArgs.push(arg.bufferFullPath)
    }

    const errorOutput = execSync(tslintPath + " " + processArgs.join(" "), { cwd: currentWorkingDirectory }).toString()

    const lintErrors = JSON.parse(errorOutput)

    const errorsWithFileName = lintErrors.map(e => ({
        type: null,
        file: e.name,
        text: e.failure,
        lineNumber: e.startPosition.line,
        startColumn: e.startPosition.character,
        endColumn: e.endPosition.character,
    }))

    const errors = errorsWithFileName.reduce((prev, curr) => {
        prev[curr.file] = prev[curr.file] || []

        prev[curr.file].push({
            type: curr.type,
            text: curr.text,
            lineNumber: curr.lineNumber + 1,
            startColumn: curr.startColumn + 1,
            endColumn: curr.endColumn
        })

        return prev
    }, {})

    Object.keys(errors).forEach(f => {
        Oni.diagnostics.setErrors("tslint-ts", f, errors[f], "yellow")
    })
}

Oni.on("buffer-saved", doLint)
Oni.on("buffer-enter", doLint)
