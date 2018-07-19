import { Event } from "oni-types"
import { EditorManager } from "./../../browser/src/Services/EditorManager"

const _onBufferSaved = new Event<any>("Test:ActiveEditor-BufferSaved")
const _onBufferEnter = new Event<any>("Test:ActiveEditor-BufferEnter")
const MockEditorManager = jest.fn<EditorManager>().mockImplementation(() => ({
    activeEditor: {
        activeBuffer: {
            filePath: "test.txt",
        },
        onBufferEnter: _onBufferEnter,
        onBufferSaved: _onBufferSaved,
    },
}))

export default MockEditorManager
