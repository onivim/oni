/**
 * installDevTools.ts
 *
 * Helper to install the redux & react devtools
 */

import * as Log from "./Log"
try {
    // tslint:disable-next-line no-var-requires
    const { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS, default: installExtension } = require("electron-devtools-installer")
    console.log('RREACT_DEVELOPER_TOOLS: ', REACT_DEVELOPER_TOOLS)
    try {
        Promise.all([
            installExtension(REDUX_DEVTOOLS),
            installExtension(REACT_DEVELOPER_TOOLS),
        ]).then((extensions) =>
            extensions.forEach(ext => Log.info(`Added extension: ${ext}`)),
        )
    } catch (e) {
        Log.info(`An error occurred: ${e}`)
    }
} catch (ex) {
    Log.warn("Unable to install developer tools. `electron-devtools-installer` may not be available in this environment")
}
