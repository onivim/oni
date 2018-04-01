/**
 * CommandContext
 *
 * This is a definition of the object that Neovim passes up
 * as part of running commands.
 */

export interface CommandContext {
    command: string
    args: string[]
}
