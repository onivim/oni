/**
 * installDevTools.js
 *
 * Helper to install the redux & react devtools
 */

try {
    const electronDevtoolsInstaller = require("electron-devtools-installer")
    electronDevtoolsInstaller.default(electronDevtoolsInstaller.REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added extension: ${name}`))
        .catch((err) => console.log(`An error occurred: ${err}`))

    electronDevtoolsInstaller.default(electronDevtoolsInstaller.REDUX_DEVTOOLS)
        .then((name) => console.log(`Added extension: ${name}`))
        .catch((err) => console.log(`An error occurred: ${err}`))
} catch (ex) {
    console.warn("Unable to install developer tools. `electron-devtools-installer` may not be available in this environment")
}

