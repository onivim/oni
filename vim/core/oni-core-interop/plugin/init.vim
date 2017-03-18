" init.vim
" Entry point for oni-interop plugin

if exists("g:loaded_oni_interop_plugin")
    finish
endif

let g:loaded_oni_interop_plugin = 1

function OniNotify(args)
    call rpcnotify(1, "oni_plugin_notify", a:args)
endfunction

function OniNotifyBufferUpdate()

    if !exists("b:last_change_tick")
        let b:last_change_tick = -1
    endif

    if b:changedtick > b:last_change_tick
        let b:last_change_tick = b:changedtick
        let buffer_lines = getline(1, '$')
        let context = OniGetContext()
        call OniNotify(["buffer_update", context, buffer_lines])
    endif
endfunction

function OniNotifyEvent(eventName)
    let context = OniGetContext()
    call OniNotify(["event", a:eventName, context])
endfunction

augroup OniNotifyBufferUpdates
    autocmd!
    autocmd! CursorMovedI * :call OniNotifyBufferUpdate()
    autocmd! CursorMoved * :call OniNotifyBufferUpdate()
    autocmd! InsertLeave * :call OniNotifyBufferUpdate()
    autocmd! InsertChange * :call OniNotifyBufferUpdate()
    autocmd! InsertEnter * :call OniNotifyBufferUpdate()
augroup END

augroup OniNotifyWindowDisplayUpdate
    autocmd!
    autocmd! BufEnter * :call OniUpdateWindowDisplayMap()
    autocmd! BufWinEnter * :call OniUpdateWindowDisplayMap()
    autocmd! WinEnter * :call OniUpdateWindowDisplayMap()
    autocmd! VimResized * :call OniUpdateWindowDisplayMap()
    autocmd! CursorMoved * :call OniUpdateWindowDisplayMap()
    autocmd! InsertLeave * :call OniUpdateWindowDisplayMap()
    autocmd! InsertEnter * :call OniUpdateWindowDisplayMap()
augroup END

augroup OniEventListeners
    autocmd!
    autocmd! BufWritePre * :call OniNotifyEvent("BufWritePre")
    autocmd! BufWritePost * :call OniNotifyEvent("BufWritePost")
    autocmd! BufEnter * :call OniNotifyEvent("BufEnter")
    autocmd! WinEnter * :call OniNotifyEvent("WinEnter")
    autocmd! BufLeave * :call OniNotifyEvent("BufLeave")
    autocmd! WinLeave * :call OniNotifyEvent("WinLeave")
    autocmd! CursorMoved * :call OniNotifyEvent("CursorMoved")
    autocmd! CursorMovedI * :call OniNotifyEvent("CursorMovedI")
    autocmd! InsertLeave * :call OniNotifyEvent("InsertLeave")
    autocmd! InsertEnter * :call OniNotifyEvent("InsertEnter")
    autocmd! DirChanged * :call OniNotifyEvent("DirChanged")
augroup END

function OniGetContext()
let context = {}
let context.bufferNumber = bufnr("%")
let context.bufferFullPath = expand("%:p")
let context.bufferTotalLines = line("$")
let context.line = line(".")
let context.column = col(".")
let context.windowNumber = winnr()
let context.winline = winline()
let context.wincol = wincol()
let context.windowTopLine = line("w0")
let context.windowBottomLine = line("w$")
let context.byte = line2byte(line(".")) + col(".")
let context.filetype = eval("&filetype")

if exists("b:last_change_tick")
    let context.version = b:last_change_tick
endif

return context
endfunction

function OniUpdateWindowDisplayMap()
    let currentWindowNumber = winnr()
    let pos = getpos(".")
    let bufNum = pos[0]
    let currentLine = pos[1]
    let currentColumn = pos[2]

    let windowStartLine = line('w0')
    let windowEndLine = line('w$')

    let mapping = {}

    let cursor = windowStartLine

    while(cursor <= windowEndLine)
        call setpos(".", [bufNum, cursor, 0])
        let cursorString = string(cursor)
        let mapping[cursorString] = winline()
        let cursor = cursor+1
    endwhile

    call setpos(".", [bufNum, currentLine, currentColumn])

    let context = OniGetContext()

    call OniNotify(["window_display_update", context, mapping])
endfunction

function OniApiInfo()
    if (has_key(api_info(),'version'))
        call OniNotify(["api_info",api_info()["version"]])
    else
        call OniNotify(["api_info",{"api_level":0}])
    endif
endfunction
