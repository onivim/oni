" targets.vim Provides additional text objects
" Author:  Christian Wellenbrock <christian.wellenbrock@gmail.com>
" License: MIT license

set runtimepath+=../
set softtabstop=16 expandtab
source ../plugin/targets.vim

function! s:execute(operation, motions)
    if a:operation == 'c'
        execute "normal " . a:operation . a:motions . "_"
    elseif a:operation == 'v'
        execute "normal " . a:operation . a:motions
        normal r_
    else
        execute "normal " . a:operation . a:motions
    endif
    if a:operation == 'y'
        execute "normal A\<Tab>'\<C-R>\"'"
    endif
    execute "normal I" . a:operation . a:motions . "\<Tab>\<Esc>"
endfunction

function! s:testBasic()
    edit test1.in
    normal gg0

    for delset in [
                \ [ '(', ')', 'b' ],
                \ [ '{', '}', 'B' ],
                \ [ '[', ']' ],
                \ [ '<', '>' ],
                \ [ 't' ]
                \ ]
        normal "lyy

        for op in [ 'c', 'd', 'y', 'v' ]
            for cnt in [ '', '1', '2' ]
                for ln in [ 'l', '', 'n' ]
                    for iaIA in [ 'I', 'i', 'a', 'A' ]
                        for del in delset
                            execute "normal \"lpfx"
                            call s:execute(op, cnt . iaIA . ln . del)
                        endfor
                    endfor
                endfor
            endfor
        endfor

        normal +
    endfor

    normal +

    for del in [ "'", '"', '`' ]
        normal "lyy

        for op in [ 'c', 'd', 'y', 'v' ]
            for cnt in [ '', '1', '2' ]
                for LlnN in [ 'L', 'l', '', 'n', 'N' ]
                    for iaIA in [ 'I', 'i', 'a', 'A' ]
                        execute "normal \"lpfx"
                        call s:execute(op, cnt . iaIA . LlnN . del)
                    endfor
                endfor
            endfor
        endfor

        normal +
    endfor

    normal +

    for del in [ ',', '.', ';', ':', '+', '-', '=', '~', '_', '*', '#', '/', '|', '\', '&', '$' ]
        normal "lyy

        for op in [ 'c', 'd', 'y', 'v' ]
            for cnt in [ '', '1', '2' ]
                for LlnN in [ 'L', 'l', '', 'n', 'N' ]
                    for iaIA in [ 'I', 'i', 'a', 'A' ]
                        execute "normal \"lpfx"
                        call s:execute(op, cnt . iaIA . LlnN . del)
                    endfor
                endfor
            endfor
        endfor

        normal +
    endfor

    normal +

    normal "lyy

    for op in [ 'c', 'd', 'y', 'v' ]
        for cnt in [ '', '1', '2' ]
            for ln in [ 'l', '', 'n' ]
                for iaIA in [ 'I', 'i', 'a', 'A' ]
                    execute "normal \"lpfx"
                    call s:execute(op, cnt . iaIA . ln . 'a')
                endfor
            endfor
        endfor
    endfor

    write! test1.out
endfunction

function! s:testMultiline()
    edit! test2.in
    normal gg0

    execute "normal /comment 1\<CR>"
    set autoindent
    execute "normal cin{foo\<Esc>"
    set autoindent&

    execute "normal /comment 2\<CR>"
    execute "normal din{"

    execute "normal /comment 3\<CR>"
    execute "normal cin;foo\<Esc>"

    execute "normal /comment 4\<CR>"
    execute "normal cin`foo\<Esc>"

    execute "normal /comment 5\<CR>"
    execute "normal cI{foo\<Esc>"

    write! test2.out
endfunction

function s:testSeeking()
    edit! test3.in
    normal gg0

    for c in split('ABCDEFGHI', '\zs')
        execute "normal /"   . c . "\<CR>"
        execute "normal ci)" . c . "\<Esc>"
    endfor

    for c in split('JKLMNO', '\zs')
        execute "normal /"   . c . "\<CR>"
        execute "normal ci'" . c . "\<Esc>"
    endfor

    write! test3.out
endfunction

function s:testVisual()
    edit! test4.in
    normal gg0

    for delset in [
                \ [ '(', ')', 'b' ],
                \ [ '{', '}', 'B' ],
                \ [ '[', ']' ],
                \ [ '<', '>' ],
                \ [ 't' ]
                \ ]
        normal "lyy

        for ia in [ 'i', 'a' ]
            for del in delset
                normal "lpfx
                execute "normal v" . ia . del . ia . del . "r_"
            endfor
        endfor

        normal +
    endfor


    write! test4.out
endfunction

function s:testModifiers()
    edit! test5.in
    normal gg0

    normal fxvItr_

    write! test5.out
endfunction

function s:testEmpty()
    edit! test6.in
    normal gg0

    normal ci"foo

    normal +

    normal ci(foo

    normal +

    normal ci,foo

    write! test6.out
endfunction

call s:testBasic()
call s:testMultiline()
call s:testSeeking()
call s:testVisual()
call s:testModifiers()
call s:testEmpty()

quit!
