/**
 * installDevTools.ts
 *
 * Helper to install the redux & react devtools
 */

import * as Log from "./Log"

try {
    const electronDevtoolsInstaller = require("electron-devtools-installer") // tslint:disable-line no-var-requires

    electronDevtoolsInstaller.default(electronDevtoolsInstaller.REDUX_DEVTOOLS)
        .then((name) => Log.info(`Added extension: ${name}`))
        .catch((err) => Log.info(`An error occurred: ${err}`))
} catch (ex) {
    Log.warn("Unable to install developer tools. `electron-devtools-installer` may not be available in this environment")
}
