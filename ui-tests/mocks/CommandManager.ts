import { CommandManager } from "./../../browser/src/Services/CommandManager"

export const mockRegisterCommands = jest.fn()
const MockCommands = jest.fn<CommandManager>().mockImplementation(() => ({
    registerCommand: mockRegisterCommands,
}))

export default MockCommands
