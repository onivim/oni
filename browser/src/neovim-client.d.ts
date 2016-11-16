declare module "neovim-client" {
  export default attach;
  function attach(writer: NodeJS.WritableStream, reader: NodeJS.ReadableStream, cb: (err: Error, nvim: Nvim) => void);

  interface Nvim {
    uiAttach(width: number, height: boolean, enable_rgb: (err: Error) => void, cb: (err: Error) => void): void;
    uiDetach(cb: (err: Error) => void): void;
    uiTryResize(width: number, height: (err: Error, res: Object) => void, cb: (err: Error, res: Object) => void): void;
    command(str: string, cb: (err: Error) => void): void;
    feedkeys(keys: string, mode: string, escape_csi: boolean, cb: (err: Error) => void): void;
    input(keys: string, cb: (err: Error, res: number) => void): void;
    replaceTermcodes(str: string, from_part: boolean, do_lt: boolean, special: boolean, cb: (err: Error, res: string) => void): void;
    commandOutput(str: string, cb: (err: Error, res: string) => void): void;
    eval(str: string, cb: (err: Error, res: Object) => void): void;
    callFunction(fname: string, args: Array<any>, cb: (err: Error, res: Object) => void): void;
    strwidth(str: string, cb: (err: Error, res: number) => void): void;
    listRuntimePaths(cb: (err: Error, res: Array<string>) => void): void;
    changeDirectory(dir: string, cb: (err: Error) => void): void;
    getCurrentLine(cb: (err: Error, res: string) => void): void;
    setCurrentLine(line: string, cb: (err: Error) => void): void;
    delCurrentLine(cb: (err: Error) => void): void;
    getVar(name: string, cb: (err: Error, res: Object) => void): void;
    setVar(name: string, value: Object, cb: (err: Error, res: Object) => void): void;
    delVar(name: string, cb: (err: Error, res: Object) => void): void;
    getVvar(name: string, cb: (err: Error, res: Object) => void): void;
    getOption(name: string, cb: (err: Error, res: Object) => void): void;
    setOption(name: string, value: Object, cb: (err: Error) => void): void;
    outWrite(str: string, cb: (err: Error) => void): void;
    errWrite(str: string, cb: (err: Error) => void): void;
    reportError(str: string, cb: (err: Error) => void): void;
    getBuffers(cb: (err: Error, res: Array<Buffer>) => void): void;
    getCurrentBuffer(cb: (err: Error, res: Buffer) => void): void;
    setCurrentBuffer(buffer: Buffer, cb: (err: Error) => void): void;
    getWindows(cb: (err: Error, res: Array<Window>) => void): void;
    getCurrentWindow(cb: (err: Error, res: Window) => void): void;
    setCurrentWindow(window: Window, cb: (err: Error) => void): void;
    getTabpages(cb: (err: Error, res: Array<Tabpage>) => void): void;
    getCurrentTabpage(cb: (err: Error, res: Tabpage) => void): void;
    setCurrentTabpage(tabpage: Tabpage, cb: (err: Error) => void): void;
    subscribe(event: string, cb: (err: Error) => void): void;
    unsubscribe(event: string, cb: (err: Error) => void): void;
    nameToColor(name: string, cb: (err: Error, res: number) => void): void;
    getColorMap(cb: (err: Error, res: {}) => void): void;
    getApiInfo(cb: (err: Error, res: Array<any>) => void): void;
  }
  interface Buffer {
    lineCount(cb: (err: Error, res: number) => void): void;
    getLine(index: number, cb: (err: Error, res: string) => void): void;
    setLine(index: number, line: string, cb: (err: Error) => void): void;
    delLine(index: number, cb: (err: Error) => void): void;
    getLineSlice(start: number, end: number, include_start: boolean, include_end: boolean, cb: (err: Error, res: Array<string>) => void): void;
    getLines(start: number, end: number, strict_indexing: boolean, cb: (err: Error, res: Array<string>) => void): void;
    setLineSlice(start: number, end: number, include_start: boolean, include_end: boolean, replacement: Array<string>, cb: (err: Error) => void): void;
    setLines(start: number, end: number, strict_indexing: boolean, replacement: Array<string>, cb: (err: Error) => void): void;
    getVar(name: string, cb: (err: Error, res: Object) => void): void;
    setVar(name: string, value: Object, cb: (err: Error, res: Object) => void): void;
    delVar(name: string, cb: (err: Error, res: Object) => void): void;
    getOption(name: string, cb: (err: Error, res: Object) => void): void;
    setOption(name: string, value: Object, cb: (err: Error) => void): void;
    getNumber(cb: (err: Error, res: number) => void): void;
    getName(cb: (err: Error, res: string) => void): void;
    setName(name: string, cb: (err: Error) => void): void;
    isValid(cb: (err: Error, res: boolean) => void): void;
    insert(lnum: number, lines: Array<string>, cb: (err: Error) => void): void;
    getMark(name: string, cb: (err: Error, res: Array<number>) => void): void;
    addHighlight(src_id: number, hl_group: string, line: number, col_start: number, col_end: number, cb: (err: Error, res: number) => void): void;
    clearHighlight(src_id: number, line_start: number, line_end: number, cb: (err: Error) => void): void;
  }
  interface Window {
    getBuffer(cb: (err: Error, res: Buffer) => void): void;
    getCursor(cb: (err: Error, res: Array<number>) => void): void;
    setCursor(pos: Array<number>, cb: (err: Error) => void): void;
    getHeight(cb: (err: Error, res: number) => void): void;
    setHeight(height: number, cb: (err: Error) => void): void;
    getWidth(cb: (err: Error, res: number) => void): void;
    setWidth(width: number, cb: (err: Error) => void): void;
    getVar(name: string, cb: (err: Error, res: Object) => void): void;
    setVar(name: string, value: Object, cb: (err: Error, res: Object) => void): void;
    delVar(name: string, cb: (err: Error, res: Object) => void): void;
    getOption(name: string, cb: (err: Error, res: Object) => void): void;
    setOption(name: string, value: Object, cb: (err: Error) => void): void;
    getPosition(cb: (err: Error, res: Array<number>) => void): void;
    getTabpage(cb: (err: Error, res: Tabpage) => void): void;
    isValid(cb: (err: Error, res: boolean) => void): void;
  }
  interface Tabpage {
    getWindows(cb: (err: Error, res: Array<Window>) => void): void;
    getVar(name: string, cb: (err: Error, res: Object) => void): void;
    setVar(name: string, value: Object, cb: (err: Error, res: Object) => void): void;
    delVar(name: string, cb: (err: Error, res: Object) => void): void;
    getWindow(cb: (err: Error, res: Window) => void): void;
    isValid(cb: (err: Error, res: boolean) => void): void;
  }
}
