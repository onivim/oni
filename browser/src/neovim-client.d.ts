declare module "neovim-client" {
    export default attach
    function attach(
        writer: NodeJS.WritableStream,
        reader: NodeJS.ReadableStream,
        cb: (err: Error, nvim: INvim) => void,
    )

    interface INvim {
        uiAttach(
            width: number,
            height: boolean,
            enableRgb: (err: Error) => void,
            cb: (err: Error) => void,
        ): void
        uiDetach(cb: (err: Error) => void): void
        uiTryResize(
            width: number,
            height: (err: Error, res: Object) => void,
            cb: (err: Error, res: Object) => void,
        ): void
        command(str: string, cb: (err: Error) => void): void
        feedkeys(keys: string, mode: string, escapeCsi: boolean, cb: (err: Error) => void): void
        input(keys: string, cb: (err: Error, res: number) => void): void
        replaceTermcodes(
            str: string,
            fromPart: boolean,
            doLt: boolean,
            special: boolean,
            cb: (err: Error, res: string) => void,
        ): void
        commandOutput(str: string, cb: (err: Error, res: string) => void): void
        eval(str: string, cb: (err: Error, res: Object) => void): void
        callFunction(fname: string, args: any[], cb: (err: Error, res: Object) => void): void
        strwidth(str: string, cb: (err: Error, res: number) => void): void
        listRuntimePaths(cb: (err: Error, res: string[]) => void): void
        changeDirectory(dir: string, cb: (err: Error) => void): void
        getCurrentLine(cb: (err: Error, res: string) => void): void
        setCurrentLine(line: string, cb: (err: Error) => void): void
        delCurrentLine(cb: (err: Error) => void): void
        getVar(name: string, cb: (err: Error, res: Object) => void): void
        setVar(name: string, value: Object, cb: (err: Error, res: Object) => void): void
        delVar(name: string, cb: (err: Error, res: Object) => void): void
        getVvar(name: string, cb: (err: Error, res: Object) => void): void
        getOption(name: string, cb: (err: Error, res: Object) => void): void
        setOption(name: string, value: Object, cb: (err: Error) => void): void
        outWrite(str: string, cb: (err: Error) => void): void
        errWrite(str: string, cb: (err: Error) => void): void
        reportError(str: string, cb: (err: Error) => void): void
        getBuffers(cb: (err: Error, res: IBuffer[]) => void): void
        getCurrentBuffer(cb: (err: Error, res: IBuffer) => void): void
        setCurrentBuffer(buffer: IBuffer, cb: (err: Error) => void): void
        getWindows(cb: (err: Error, res: IWindow[]) => void): void
        getCurrentWindow(cb: (err: Error, res: IWindow) => void): void
        setCurrentWindow(window: IWindow, cb: (err: Error) => void): void
        getTabpages(cb: (err: Error, res: ITabpage[]) => void): void
        getCurrentTabpage(cb: (err: Error, res: ITabpage) => void): void
        setCurrentTabpage(tabpage: ITabpage, cb: (err: Error) => void): void
        subscribe(event: string, cb: (err: Error) => void): void
        unsubscribe(event: string, cb: (err: Error) => void): void
        nameToColor(name: string, cb: (err: Error, res: number) => void): void
        getColorMap(cb: (err: Error, res: {}) => void): void
        getApiInfo(cb: (err: Error, res: any[]) => void): void
    }

    interface IBuffer {
        lineCount(cb: (err: Error, res: number) => void): void
        getLine(index: number, cb: (err: Error, res: string) => void): void
        setLine(index: number, line: string, cb: (err: Error) => void): void
        delLine(index: number, cb: (err: Error) => void): void
        getLineSlice(
            start: number,
            end: number,
            includeStart: boolean,
            includeEnd: boolean,
            cb: (err: Error, res: string[]) => void,
        ): void
        getLines(
            start: number,
            end: number,
            strictIndexing: boolean,
            cb: (err: Error, res: string[]) => void,
        ): void
        setLineSlice(
            start: number,
            end: number,
            includeStart: boolean,
            includeEnd: boolean,
            replacement: string[],
            cb: (err: Error) => void,
        ): void
        setLines(
            start: number,
            end: number,
            strictIndexing: boolean,
            replacement: string[],
            cb: (err: Error) => void,
        ): void
        getVar(name: string, cb: (err: Error, res: Object) => void): void
        setVar(name: string, value: Object, cb: (err: Error, res: Object) => void): void
        delVar(name: string, cb: (err: Error, res: Object) => void): void
        getOption(name: string, cb: (err: Error, res: Object) => void): void
        setOption(name: string, value: Object, cb: (err: Error) => void): void
        getNumber(cb: (err: Error, res: number) => void): void
        getName(cb: (err: Error, res: string) => void): void
        setName(name: string, cb: (err: Error) => void): void
        isValid(cb: (err: Error, res: boolean) => void): void
        insert(lnum: number, lines: string[], cb: (err: Error) => void): void
        getMark(name: string, cb: (err: Error, res: number[]) => void): void
        addHighlight(
            srcId: number,
            hlGroup: string,
            line: number,
            colStart: number,
            colEnd: number,
            cb: (err: Error, res: number) => void,
        ): void
        clearHighlight(
            srcId: number,
            lineStart: number,
            lineEnd: number,
            cb: (err: Error) => void,
        ): void
    }

    interface IWindow {
        getBuffer(cb: (err: Error, res: IBuffer) => void): void
        getCursor(cb: (err: Error, res: number[]) => void): void
        setCursor(pos: number[], cb: (err: Error) => void): void
        getHeight(cb: (err: Error, res: number) => void): void
        setHeight(height: number, cb: (err: Error) => void): void
        getWidth(cb: (err: Error, res: number) => void): void
        setWidth(width: number, cb: (err: Error) => void): void
        getVar(name: string, cb: (err: Error, res: Object) => void): void
        setVar(name: string, value: Object, cb: (err: Error, res: Object) => void): void
        delVar(name: string, cb: (err: Error, res: Object) => void): void
        getOption(name: string, cb: (err: Error, res: Object) => void): void
        setOption(name: string, value: Object, cb: (err: Error) => void): void
        getPosition(cb: (err: Error, res: number[]) => void): void
        getTabpage(cb: (err: Error, res: ITabpage) => void): void
        isValid(cb: (err: Error, res: boolean) => void): void
    }

    interface ITabpage {
        getWindows(cb: (err: Error, res: IWindow[]) => void): void
        getVar(name: string, cb: (err: Error, res: Object) => void): void
        setVar(name: string, value: Object, cb: (err: Error, res: Object) => void): void
        delVar(name: string, cb: (err: Error, res: Object) => void): void
        getWindow(cb: (err: Error, res: IWindow) => void): void
        isValid(cb: (err: Error, res: boolean) => void): void
    }
}
