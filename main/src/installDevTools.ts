/**
 * installDevTools.ts
 *
 * Helper to install the redux & react devtools
 */

import * as Log from "./Log"
export default async () => {
    try {
        const {
            REACT_DEVELOPER_TOOLS,
            REDUX_DEVTOOLS,
            default: installExtension,
        } = require("electron-devtools-installer")
        try {
            const reduxExt = await installExtension(REDUX_DEVTOOLS)
            Log.info(`Added extension: ${reduxExt}`)
            const reactExt = await installExtension(REACT_DEVELOPER_TOOLS)
            Log.info(`Added extension: ${reactExt}`)
        } catch (e) {
            Log.info(`An error occurred: ${e}`)
        }
    } catch (ex) {
        Log.warn(
            "Unable to install developer tools. `electron-devtools-installer` may not be available in this environment",
        )
    }
}
