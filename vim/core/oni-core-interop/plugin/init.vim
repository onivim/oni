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
        if mode() == 'i'
            let buffer_line = getline(".")
            let context = OniGetContext()
            call OniNotify(["incremental_buffer_update", context, buffer_line, line(".")])
        else
            let buffer_lines = getline(1,"$")
            let context = OniGetContext()
            call OniNotify(["buffer_update", context, buffer_lines])
        endif
    endif
endfunction

function OniNotifyEvent(eventName)
    let context = OniGetContext()
    call OniNotify(["event", a:eventName, context])
endfunction

function OniOpenFile(strategy, file)
     if bufname('%') != ''
         exec a:strategy . a:file
     elseif &modified
         exec a:strategy . a:file
     else
         exec ":e " . a:file
     endif
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
    autocmd! BufEnter * :call OniUpdateWindowDisplayMap(1)
    autocmd! BufWinEnter * :call OniUpdateWindowDisplayMap(1)
    autocmd! WinEnter * :call OniUpdateWindowDisplayMap(1)
    autocmd! VimResized * :call OniUpdateWindowDisplayMap(1)
    autocmd! CursorMoved * :call OniUpdateWindowDisplayMap(0)
    autocmd! InsertLeave * :call OniUpdateWindowDisplayMap(0)
    autocmd! InsertEnter * :call OniUpdateWindowDisplayMap(0)
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
let context.mode = mode()
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

function OniUpdateWindowDisplayMap(shouldMeasure)
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

    call OniNotify(["window_display_update", context, mapping, a:shouldMeasure])
endfunction

function OniConnect()
    call OniApiInfo()

    " Force BufEnter and buffer update events to be dispatched on connection
    " Otherwise, there can be race conditions where the buffer is loaded
    " prior to the UI attaching. See #122
    call OniNotifyEvent("BufEnter")
    call OniNotifyBufferUpdate()
endfunction


function OniApiInfo()
    if (has_key(api_info(),'version'))
        call OniNotify(["api_info",api_info()["version"]])
    else
        call OniNotify(["api_info",{"api_level":0}])
    endif
endfunction
