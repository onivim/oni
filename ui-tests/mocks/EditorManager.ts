import { Event } from "oni-types"
import { EditorManager } from "./../../browser/src/Services/EditorManager"

const _onBufferSaved = new Event<any>("Test:ActiveEditor-BufferSaved")
const _onBufferEnter = new Event<any>("Test:ActiveEditor-BufferEnter")
const _onQuit = new Event<void>()

const MockEditorManager = jest.fn<EditorManager>().mockImplementation(() => ({
    activeEditor: {
        onQuit: _onQuit,
        activeBuffer: {
            filePath: "test.txt",
        },
        onBufferEnter: _onBufferEnter,
        onBufferSaved: _onBufferSaved,
        restoreSession: jest.fn(),
        persistSession: jest.fn(),
        getCurrentSession: jest.fn().mockReturnValue("test-session"),
    },
}))

export default MockEditorManager
