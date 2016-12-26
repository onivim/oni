
Oni.on("buffer-update", (args) => {

    if (!args.eventContext.bufferFullPath) {
        return
    }

    console.log("edited: " + args.eventContext.bufferFullPath)

    Oni.diagnostics.setErrors("tslint", args.eventContext.bufferFullPath, [{ type: null, text: "derp", lineNumber: 1, startColumn: 0, endColumn: 1}], "yellow")
})
