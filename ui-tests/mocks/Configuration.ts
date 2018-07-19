import * as Oni from "oni-api"

const Configuration = jest.fn<Oni.Configuration>().mockImplementation(() => {
    return {
        onConfigurationChanged() {
            return {
                subscribe: jest.fn(),
            }
        },
        notifyListeners: jest.fn(),
        updateConfig: jest.fn(),
        getValue: jest.fn(),
    }
})

export const configuration = new Configuration()
export default Configuration
