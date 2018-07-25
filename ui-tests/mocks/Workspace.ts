import { IWorkspace, Workspace } from "./../../browser/src/Services/Workspace"

const MockWorkspace = jest.fn<IWorkspace>().mockImplementation(() => ({
    activeDirectory: "test/dir",
    onDirectoryChanged: {
        subscribe: jest.fn(),
    },
    onFocusGained: {
        subscribe: jest.fn(),
    },
}))

export default MockWorkspace
