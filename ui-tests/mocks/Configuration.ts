const Configuration = jest.fn().mockImplementation(() => {
    return {
        notifyListeners: jest.fn(),
        updateConfig: jest.fn(),
    }
})

export const configuration = Configuration
export default Configuration
