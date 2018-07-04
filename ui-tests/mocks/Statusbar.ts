import * as Oni from "oni-api"

export const mockStatusBarShow = jest.fn()
export const mockStatusBarHide = jest.fn()
export const mockStatusBarSetContents = jest.fn()
export const mockStatusBarDisposal = jest.fn()

const MockStatusbar = jest.fn<Oni.StatusBar>().mockImplementation(() => ({
    createItem(alignment: number, vcsId: string) {
        return {
            show: mockStatusBarShow,
            hide: mockStatusBarHide,
            setContents: mockStatusBarSetContents,
            dispose: mockStatusBarDisposal,
        }
    },
}))

export default MockStatusbar
