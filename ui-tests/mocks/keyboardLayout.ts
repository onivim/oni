const getCurrentKeyboardLanguage = jest.fn()

export const KeyboardLayoutManager = jest.fn().mockImplementation(() => {
    return {
        onKeyMapChanged: {
            subscribe: jest.fn(),
            dispatch: jest.fn(),
        },
        getCurrentKeyMap: jest.fn(),
        getCurrentKeyboardLanguage,
    }
})

export default KeyboardLayoutManager
