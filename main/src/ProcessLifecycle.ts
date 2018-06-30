import { app } from "electron"

import * as Log from "./Log"

export const makeSingleInstance = (options, callbackFunction) => {
    const isSecondInstance = app.makeSingleInstance((args, workingDirectory) => {
        callbackFunction({
            args,
            workingDirectory,
        })
    })

    if (isSecondInstance) {
        app.quit()
    }
}
