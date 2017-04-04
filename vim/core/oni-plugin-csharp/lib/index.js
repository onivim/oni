const path = require("path")
const childProcess = require("child_process")

const fs = require("fs")

const rpc = require("vscode-jsonrpc")

const activate = (Oni) => {
    // alert("HEY CS")

    const omniSharpLangServerPath = path.join(__dirname, "..", "..", "..", "..", "node_modules", "omnisharp-client", "languageserver", "server.js")

    // const omniSharpLangServerPath = "C:/test/language-server/index.js"
    const omniSharpProcess = childProcess.exec(`node "${omniSharpLangServerPath}"`, { maxBuffer: 500 * 1024 * 1024 }, (err) => {
        if (err) {
            console.error(err)
            alert(err)
        }
    })

    let connection = rpc.createMessageConnection(
            new rpc.StreamMessageReader(omniSharpProcess.stdout), 
            new rpc.StreamMessageWriter(omniSharpProcess.stdin))

    const initializeNotification = new rpc.NotificationType("initialize")
    
    const initializedNotification = new rpc.NotificationType("initialized")

    connection.onNotification("initialized", (param) => {
        alert("Initialized")
    })

    connection.listen()

    connection.sendRequest("initialize", {
        rootPath: "C:/test/dotnet-core",
        capabilities: {
            highlightProvider: true
        }
        // capabilities: {
        //     workspace: null,
        //     textDocument: null,
        //     experimental: null
        // }
    }).then((result) => {

        const text = fs.readFileSync("C:/test/dotnet-core/Program.cs").toString("utf8")

        connection.sendNotification("textDocument/didOpen", {
            textDocument: {
                uri: "file:///C:/test/dotnet-core/Program.cs",
                languageId: "csharp",
                version: 0,
                text: text
            }
        })

        alert("initialized")

        const getQuickInfo = (textDocumentPosition) => {

            return connection.sendRequest("textDocument/hover", {
                 textDocument:    {
                    uri: "file:///C:/test/dotnet-core/Program.cs"
                },
                position: {
                    line: textDocumentPosition.line - 1,
                    character: textDocumentPosition.column - 1
                }
            }).then((result) => {
                return { title: result.contents }
            })
        }

        Oni.registerLanguageService({
            getQuickInfo: getQuickInfo
        })

    })

}

module.exports = {
    activate
}
