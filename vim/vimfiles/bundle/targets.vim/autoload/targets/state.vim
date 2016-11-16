let s:invalid = 0
let s:empty = 1
let s:nonempty = 2

function! targets#state#new(state)
    return {
        \ 'state': a:state,
        \
        \ 'isInvalid': function('targets#state#isInvalid'),
        \ 'isEmpty': function('targets#state#isEmpty'),
        \ 'isNonempty': function('targets#state#isNonempty'),
        \ 'isValid': function('targets#state#isValid'),
        \ 'isInvalidOrEmpty': function('targets#state#isInvalidOrEmpty'),
        \ }
endfunction

" constructors

function! targets#state#invalid()
    return targets#state#new(s:invalid)
endfunction

function! targets#state#nonempty()
    return targets#state#new(s:nonempty)
endfunction

function! targets#state#empty()
    return targets#state#new(s:empty)
endfunction

" raw attributes

function! targets#state#isInvalid() dict
    return self.state == s:invalid
endfunction

function! targets#state#isEmpty() dict
    return self.state == s:empty
endfunction

function! targets#state#isNonempty() dict
    return self.state == s:nonempty
endfunction

" derived attributes

" empty or nonempty
function! targets#state#isValid() dict
    return self.state != s:invalid
endfunction

function! targets#state#isInvalidOrEmpty() dict
    return self.state != s:nonempty
endfunction
