import { Workspace } from "./../../browser/src/Services/Workspace"

const MockWorkspace = jest.fn<Workspace>().mockImplementation(() => ({
    activeDirectory: "test/dir",
    onDirectoryChanged: {
        subscribe: jest.fn(),
    },
    onFocusGained: {
        subscribe: jest.fn(),
    },
}))

export default MockWorkspace
