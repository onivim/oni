const SharedNeovimInstance = jest.fn().mockImplementation(() => ({
    bindToMenu: () => ({
        setItems: jest.fn(),
        onCursorMoved: {
            subscribe: jest.fn(),
        },
    }),
}))

export const getInstance = new SharedNeovimInstance()
