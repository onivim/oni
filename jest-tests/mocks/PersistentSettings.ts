export const get = jest.fn()

export const PersistedConfiguration = jest.fn().mockImplementation(() => {
    return {
        getPersistedValues: jest.fn(),
        setPersistedValues: jest.fn(),
    }
})
