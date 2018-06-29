// BuildSetupTemplate.js
//
// Helper script to insert template variables into the setup template

const path = require("path")
const fs = require("fs")
const os = require("os")

const _ = require("lodash")
const shelljs = require("shelljs")

const sourceFile = path.join(__dirname, "setup.template.iss")
const destFile = path.join(__dirname, "..", "dist", "setup.iss")

shelljs.rm(destFile)

shelljs.cp(sourceFile, destFile)

const packageJsonContents = fs.readFileSync(path.join(__dirname, "..", "package.json"))
const packageMeta = JSON.parse(packageJsonContents)
const { version, name } = packageMeta
const prodName = packageMeta.build.productName

let buildFolderPrefix = os.arch() === "x32" ? "ia32-" : ""

if (process.env["APPVEYOR"]) {
    buildFolderPrefix = process.env["PLATFORM"] === "x86" ? "ia32-" : ""
}

// Replace template variables

const valuesToReplace = {
    AppName: prodName,
    AppExecutableName: `${prodName}.exe`,
    AppSetupExecutableName: `${prodName}-${version}-${buildFolderPrefix}win`,
    Version: version,
    SourcePath: path.join(__dirname, "..", "dist", `win-${buildFolderPrefix}unpacked`, "*"),
    WizardImageFilePath: path.join(__dirname, "setup", "Oni_128.bmp"),
    WizardSmallImageFilePath: path.join(__dirname, "setup", "Oni_54.bmp"),
}

const addToEnv = `
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}\\resources\\app\\cli\\windows\\"; Tasks: addtopath; Check: NeedsAddPath(ExpandConstant('{app}'))

Root: HKCU; Subkey: "SOFTWARE\\Classes\\*\\shell\\${prodName}"; ValueType: expandsz; ValueName: ""; ValueData: "Open with ${prodName}"; Tasks: addToRightClickMenu; Flags: uninsdeletekey
Root: HKCU; Subkey: "SOFTWARE\\Classes\\*\\shell\\${prodName}"; ValueType: expandsz; ValueName: "Icon"; ValueData: "{app}\\resources\\app\\images\\oni.ico"; Tasks: addToRightClickMenu
Root: HKCU; Subkey: "SOFTWARE\\Classes\\*\\shell\\${prodName}\\command"; ValueType: expandsz; ValueName: ""; ValueData: """{app}\\${prodName}.exe"" ""%1"""; Tasks: addToRightClickMenu
`

function getFileRegKey(ext, desc) {
    return `
Root: HKCR; Subkey: "${ext}\\OpenWithProgids"; ValueType: none; ValueName: "${prodName}"; Flags: deletevalue uninsdeletevalue; Tasks: registerAsEditor;
Root: HKCR; Subkey: "${ext}\\OpenWithProgids"; ValueType: string; ValueName: "${prodName}${ext}"; ValueData: ""; Flags: uninsdeletevalue; Tasks: registerAsEditor;
Root: HKCR; Subkey: "${prodName}${ext}"; ValueType: string; ValueName: ""; ValueData: "${desc}"; Flags: uninsdeletekey; Tasks: registerAsEditor;
Root: HKCR; Subkey: "${prodName}${ext}\\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\\resources\\app\\images\\oni.ico"; Tasks: registerAsEditor;
Root: HKCR; Subkey: "${prodName}${ext}\\shell\\open\\command"; ValueType: string; ValueName: ""; ValueData: """{app}\\${prodName}.exe"" ""%1"""; Tasks: registerAsEditor;
`
}

_.keys(valuesToReplace).forEach(key => {
    shelljs.sed("-i", "{{" + key + "}}", valuesToReplace[key], destFile)
})

let allFilesToAddRegKeysFor = ""

packageMeta.build.fileAssociations.forEach(association => {
    allFilesToAddRegKeysFor += getFileRegKey(`.${association.ext}`, association.name)
})

allFilesToAddRegKeysFor += addToEnv

shelljs.sed("-i", "{{RegistryKey}}", allFilesToAddRegKeysFor, destFile)
