import { SidebarManager } from "./../../browser/src/Services/Sidebar"

const MockSidebar = jest.fn<SidebarManager>().mockImplementation(() => ({
    entries: [
        {
            id: "git-vcs",
        },
    ],
}))

export default MockSidebar
