
var os = require("os")

var currentWords = []
var lastBuffer = []

const activate = (Oni) => {
    Oni.on("buffer-update", (args) => {
        const fullText = args.bufferLines.join(os.EOL)
        const words = fullText.split(/\W+/)

        lastBuffer = args.bufferLines

        currentWords = Object.keys(words.reduce((prev, cur) => {
            prev[cur] = cur
            return prev
        }, {}))
            .filter(w => w.length >= 3)
    })

    const getCompletions = (textDocumentPosition) => {
        if (textDocumentPosition.column <= 1)
            return Promise.resolve({
                completions: []
            })

        let currentLine = lastBuffer[textDocumentPosition.line - 1];
        let col = textDocumentPosition.column - 2
        let currentPrefix = "";

        while (col >= 0) {
            const currentCharacter = currentLine[col]

            if (!currentCharacter.match(/[_a-z]/i))
                break

            currentPrefix = currentCharacter + currentPrefix
            col--
        }

        const basePos = col;

        if (currentPrefix.length < 1)
            return Promise.resolve({
                base: currentPrefix,
                completions: []
            })


        return Promise.resolve({
            base: currentPrefix,
            completions: currentWords.filter(w => w.indexOf(currentPrefix) === 0).map(w => ({
                label: w,
                kind: "text"
            }))
        })
    }

    Oni.registerLanguageService({
        getCompletions: getCompletions
    })

}

module.exports = {
    activate
}
