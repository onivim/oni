" init.vim
" Entry point for oni-interop plugin

if exists("g:loaded_oni_interop_plugin")
    finish
endif

set hidden

let g:loaded_oni_interop_plugin = 1

function OniNotify(args)
    call rpcnotify(1, "oni_plugin_notify", a:args)
endfunction

function OniNotifyWithBuffers(eventName)
    "NOTE: Get all buffers can return a 0 instead of a buffer
    " due to viml's implicit returns if a conditional fails
    let l:allBufs = OniGetAllBuffers()
    let l:current = OniGetContext()
    let l:context = {}
    let l:context.current = l:current
    let l:context.existingBuffers = l:allBufs
    call OniNotify(["event", a:eventName, l:context])
endfunction

function OniNoop()

endfunction

function OniNotifyEvent(eventName)
    let context = OniGetContext()
    call OniNotify(["event", a:eventName, context])
endfunction


function! s:filter_buffer(i)
  return bufexists(a:i) && buflisted(a:i) && "quickfix" !=? getbufvar(a:i, "&buftype")
endfunction

function User_buffers() " help buffers are always unlisted, but quickfix buffers are not
  return filter(range(1,bufnr('$')),'s:filter_buffer(v:val)')
endfunction

function OniGetAllBuffers()
  let l:buffers = []
  let l:bufnums = User_buffers()
  if exists("l:bufnums")
    for l:bufnum in l:bufnums
      try
        let l:buffer = OniGetEachContext(l:bufnum)
        let l:buffers += [l:buffer]
      catch /.*/
      "Probably dont want this outside of a debugging scenario
      " echohl WarningMsg
      " echo v:exception
      " echohl none
    endtry
    endfor
    return l:buffers
  endif
endfunction


function OniGetEachContext(bufnum)
  let l:context = {}
    let l:bufpath = bufname(a:bufnum)

    if strlen(l:bufpath)
      let l:context.bufferNumber = a:bufnum
      let l:context.bufferFullPath = expand("#".a:bufnum.":p")
      let l:context.filetype = getbufvar(a:bufnum, "&filetype")
      let l:context.buftype = getbufvar(a:bufnum, "&buftype")
      let l:context.modified = getbufvar(a:bufnum, "&mod")
      let l:context.hidden = getbufvar(a:bufnum, "&hidden")
      let l:context.listed = getbufvar(a:bufnum, "&buflisted")

      if exists("b:last_change_tick")
        let l:context.version = b:last_change_tick
      endif

      return l:context
    elseif -1 < index(['nofile','acwrite'], getbufvar(a:bufnum, '&buftype')) " scratch buffer
        return
  endif
endif
endfunction

function OniCommand(oniCommand, ...)
    let l:function_command_and_args = {}
    let l:function_command_and_args.command = a:oniCommand
    let l:function_command_and_args.args = a:000

    call OniNotify(["oni_command", l:function_command_and_args])
endfunction

augroup OniClipboard
    autocmd!
    autocmd! TextYankPost * :call OniNotifyYank(v:event)
augroup end

augroup OniEventListeners
    autocmd!
    autocmd! BufWritePre * :call OniNotifyEvent("BufWritePre")
    autocmd! BufWritePost * :call OniNotifyEvent("BufWritePost")
    autocmd! BufEnter * :call OniNotifyWithBuffers("BufEnter")
    autocmd! BufRead * :call OniNotifyWithBuffers("BufRead")
    autocmd! BufWinEnter * :call OniNotifyWithBuffers("BufWinEnter")
    autocmd! ColorScheme * :call OniNotifyEvent("ColorScheme")
    autocmd! FileType * :call OniNotifyEvent("FileType")
    autocmd! WinEnter * :call OniNotifyEvent("WinEnter")
    autocmd! BufDelete * :call OniNotifyWithBuffers("BufDelete")
    autocmd! BufUnload * :call OniNotifyWithBuffers("BufUnload")
    autocmd! BufWipeout * :call OniNotifyWithBuffers("BufWipeout")
    autocmd! CursorMoved * :call OniNotifyEvent("CursorMoved")
    autocmd! CursorMovedI * :call OniNotifyEvent("CursorMovedI")
    autocmd! InsertLeave * :call OniNotifyEvent("InsertLeave")
    autocmd! InsertEnter * :call OniNotifyEvent("InsertEnter")
    autocmd! DirChanged * :call OniNotifyEvent("DirChanged")
    autocmd! VimResized * :call OniNotifyEvent("VimResized")
    autocmd! VimLeave * :call OniNotifyEvent("VimLeave")
augroup END

function OniGetContext()
let context = {}
let context.bufferNumber = bufnr("%")
let context.bufferFullPath = expand("%:p")
let context.bufferTotalLines = line("$")
let context.line = line(".")
let context.column = col(".")
let context.mode = mode()
let context.tabNumber = tabpagenr()
let context.windowNumber = win_getid()
let context.winline = winline()
let context.wincol = wincol()
let context.windowTopLine = line("w0")
let context.windowBottomLine = line("w$")
let context.windowWidth = winwidth(winnr())
let context.windowHeight = winheight(winnr())
let context.byte = line2byte (line ( "." ) ) + col ( "." ) - 1
let context.filetype = eval("&filetype")
let context.modified = &modified
let context.hidden = &hidden
let context.listed = &buflisted
let context.tabstop = &tabstop
let context.shiftwidth = shiftwidth()
let context.comments = &comments

if exists("b:last_change_tick")
    let context.version = b:last_change_tick
endif

return context
endfunction

function OniNotifyYank(yankEvent)
    call OniNotify(["oni_yank", a:yankEvent])
endfunction


" Window navigation excerpt from:
" http://blog.paulrugelhiatt.com/vim/2014/10/31/vim-tip-automatically-create-window-splits-with-movement.html

function! s:GotoNextWindow( direction )
  let l:prevWinNr = winnr()
  execute 'wincmd' a:direction
  return winnr() != l:prevWinNr
endfunction

function! OniNextWindow( direction )
  if ! s:GotoNextWindow(a:direction)
    if a:direction == 'h'
      call OniCommand("window.moveLeft")
    elseif a:direction == 'j'
      call OniCommand("window.moveDown")
    elseif a:direction == 'k'
      call OniCommand("window.moveUp")
    elseif a:direction == 'l'
      call OniCommand("window.moveRight")
    endif
    execute 'wincmd' a:direction
  endif
endfunction

function! OniSetMarkAndReport(mark)
     execute 'normal! m' . a:mark
    call OniCommand("_internal.notifyMarksChanged")
endfunction

let s:all_marks = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function! OniListenForMarks()

    let n = 0
    let s:maxmarks = strlen(s:all_marks)
    while n < s:maxmarks
        let c = strpart(s:all_marks, n, 1)
        execute "nnoremap <silent> m" . c . " :<C-u> call OniSetMarkAndReport('" . c . "')<CR>"
        let n = n + 1
    endwhile
    call OniCommand("_internal.notifyMarksChanged")
endfunction

nnoremap <silent> gd :<C-u>call OniCommand("language.gotoDefinition")<CR>
nnoremap <silent> <C-w>h :<C-u>call OniNextWindow('h')<CR>
nnoremap <silent> <C-w>j :<C-u>call OniNextWindow('j')<CR>
nnoremap <silent> <C-w>k :<C-u>call OniNextWindow('k')<CR>
nnoremap <silent> <C-w>l :<C-u>call OniNextWindow('l')<CR>
nnoremap <silent> <C-w><C-h> :<C-u>call OniNextWindow('h')<CR>
nnoremap <silent> <C-w><C-j> :<C-u>call OniNextWindow('j')<CR>
nnoremap <silent> <C-w><C-k> :<C-u>call OniNextWindow('k')<CR>
nnoremap <silent> <C-w><C-l> :<C-u>call OniNextWindow('l')<CR>

nnoremap <silent> <C-w><s> :<C-u>call OniCommand('editor.split.horizontal')<CR>)
nnoremap <silent> <C-w><C-s> :<C-u>call OniCommand('editor.split.horizontal')<CR>)
nnoremap <silent> <C-w><v> :<C-u>call OniCommand('editor.split.vertical')<CR>)
nnoremap <silent> <C-w><C-v> :<C-u>call OniCommand('editor.split.vertical')<CR>)
