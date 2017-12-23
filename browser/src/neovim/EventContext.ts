/**
 * EventContext
 *
 * This is a definition of the object that Neovim passes up
 * as part of autocommands.
 */

export interface EventContext {
    bufferFullPath: string
    bufferTotalLines: number
    bufferNumber: number
    modified: boolean
    hidden: boolean
    listed: boolean
    version: number
    line: number
    /**
     * Column within the buffer
     */
    column: number
    byte: number
    filetype: string
    tabNumber: number
    windowNumber: number
    wincol: number
    winline: number
    windowTopLine: number
    windowBottomLine: number
    windowWidth: number
    windowHeight: number
}

export interface InactiveBufferContext {
    bufferNumber: number
    bufferFullPath: string
    filetype: string
    buftype: string
    modified: boolean
    hidden: boolean
    listed: boolean
    version: number
}

export interface BufferEventContext {
    current: EventContext
    existingBuffers: InactiveBufferContext[]
}
