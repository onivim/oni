// BuildSetupTemplate.js
//
// Helper script to insert template variables into the setup template

const path = require("path")
const fs = require("fs")

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

// Replace template variables

const valuesToReplace = {
    "AppName": prodName,
    "AppExecutableName": `${prodName}.exe`,
    "AppSetupExecutableName": `${prodName}-${version}-ia32-win`,
    "Version": version,
    "SourcePath": path.join(__dirname, "..", "dist", "win-ia32-unpacked", "*"),
    "WizardImageFilePath": path.join(__dirname, "setup", "Oni_128.bmp"),
    "WizardSmallImageFilePath": path.join(__dirname, "setup", "Oni_54.bmp")
}

const fileExtensions = {
    ".txt": "Text Files",
    ".ts": "TypeScript Files",
    ".js": "JavaScript Files",
    ".tsx": "TypeScript Files",
    ".jsx": "JavaScript Files",
    ".md": "Markdown Files"
}

const addToEnv = `
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Tasks: addtopath; Check: NeedsAddPath(ExpandConstant('{app}'))`

function getFileRegKey(ext, desc) {

    return `
Root: HKCR; Subkey: "${ext}\\OpenWithProgids"; ValueType: none; ValueName: "${prodName}"; Flags: deletevalue uninsdeletevalue; Tasks: registerAsEditor;
Root: HKCR; Subkey: "${ext}\\OpenWithProgids"; ValueType: string; ValueName: "${prodName}${ext}"; ValueData: ""; Flags: uninsdeletevalue; Tasks: registerAsEditor;
Root: HKCR; Subkey: "${prodName}${ext}"; ValueType: string; ValueName: ""; ValueData: "${desc}"; Flags: uninsdeletekey; Tasks: registerAsEditor;
Root: HKCR; Subkey: "${prodName}${ext}\\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\\resources\\app\\images\\oni.ico"; Tasks: registerAsEditor;
Root: HKCR; Subkey: "${prodName}${ext}\\shell\\open\\command"; ValueType: string; ValueName: ""; ValueData: """{app}\\${prodName}.exe"" ""%1"""; Tasks: registerAsEditor;
`
}

_.keys(valuesToReplace).forEach((key) => {
    shelljs.sed("-i", "{{" + key + "}}", valuesToReplace[key], destFile)
})

let allFilesToAddRegKeysFor = ""

_.keys(fileExtensions).forEach((key) => {
    allFilesToAddRegKeysFor += getFileRegKey(key, fileExtensions[key])
})

allFilesToAddRegKeysFor += addToEnv

shelljs.sed("-i", "{{RegistryKey}}", allFilesToAddRegKeysFor, destFile)