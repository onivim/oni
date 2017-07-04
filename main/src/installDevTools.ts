/**
 * installDevTools.js
 *
 * Helper to install the redux & react devtools
 */


import electronDevToolsInstaller from "electron-devtools-installer"
try {
    electronDevToolsInstaller(electronDevToolsInstaller.REDUX_DEVTOOLS)
        .then((name) => console.log(`Added extension: ${name}`)) // tslint:disable-line no-console
        .catch((err) => console.log(`An error occurred: ${err}`)) // tslint:disable-line no-console
} catch (ex) {
    console.warn("Unable to install developer tools. `electron-devtools-installer` may not be available in this environment")
}

