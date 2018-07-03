import { app } from "electron"

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

    app.on("ready", () => {
        callbackFunction(options)
    })
}
