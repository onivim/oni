const fs = require("fs")
const os = require("os")
const path = require("path")
const childProcess = require("child_process")
const rimraf = require("rimraf")

const nodeModulesBinFolder = path.join(__dirname, "..", "node_modules", ".bin")

const executable = os.platform() === "win32" ? "bsb.cmd" : "bsb"

const bsbExecutable = path.join(nodeModulesBinFolder, executable)

console.log("bsb executable: " + bsbExecutable)

const projectFolder = path.join(os.tmpdir(), "oni-test-reason-project")

if (fs.existsSync(projectFolder)) {
    rimraf.sync(projectFolder)
}

console.log("Creating project at: " + projectFolder)

const output = childProcess.spawnSync(bsbExecutable, ["-init", "oni-test-reason-project", "-theme", "basic-reason"], { cwd: os.tmpdir() })
console.log(output.stderr.toString())
console.log(output.stdout.toString())


console.log("Building project...")

const output2 = childProcess.execSync("npm run build", { cwd: projectFolder})

if (output2.stderr) {
    console.error(output2.stderr.toString())
}

if (output2.stdout) {
    console.log(output2.stdout.toString())
}
