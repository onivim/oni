import { SidebarManager } from "./../../browser/src/Services/Sidebar"

const MockSidebar = jest.fn<SidebarManager>().mockImplementation(() => ({
    add: jest.fn(),
    entries: [
        {
            id: "git-vcs",
        },
    ],
}))

export default MockSidebar
