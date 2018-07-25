import { MenuManager } from "./../../browser/src/Services/Menu"

export const mockMenuShow = jest.fn()
const MockMenu = jest.fn<MenuManager>().mockImplementation(() => ({
    create() {
        return {
            show: mockMenuShow,
            setItems(items: {}) {
                return items
            },
            onItemSelected: {
                subscribe: jest.fn(),
            },
        }
    },
}))

export default MockMenu
