const activate = (Oni) => {

    const command = Oni.configuration.getValue("ocaml.langServerCommand", "ocaml-language-server")

//     const debugOptions = {
//         command: "node",
//         args: ["--inspect", "/Users/bryphe/ocaml-language-server/out/src/server/index.js", "--stdio"]
//     }

    const serverOptions = {
        command,
        args: ["--stdio"],
    }

    const getInitializationOptionsAsync = (filePath) => {
        return Promise.resolve({
            clientName: "ocaml",
            rootPath: null,
            capabilities: {
                highlightProvider: true,
            }
        })
    }

    const client = Oni.createLanguageClient(serverOptions, getInitializationOptionsAsync)
}

module.exports = {
    activate
}
