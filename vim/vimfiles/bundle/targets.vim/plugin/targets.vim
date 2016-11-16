" targets.vim Provides additional text objects
" Author:  Christian Wellenbrock <christian.wellenbrock@gmail.com>
" License: MIT license

if exists("g:loaded_targets") || &cp || v:version < 700
    finish
endif
let g:loaded_targets = '0.4.2' " version number
let s:save_cpoptions = &cpoptions
set cpo&vim

function! s:addMapping1(mapType, mapping, aiAI)
    if a:aiAI !=# ' '
        silent! execute a:mapType . 'noremap <silent> <unique>' . a:aiAI . a:mapping
    endif
endfunction

function! s:addMapping2(mapType, mapping, aiAI, nlNL)
    if a:aiAI !=# ' ' && a:nlNL !=# ' '
        silent! execute a:mapType . 'noremap <silent> <unique>' . a:aiAI . a:nlNL . a:mapping
    endif
endfunction

" pair text objects (multi line objects with single line seek)
" cursor  │                        .........
" line    │ a ( bbbbbb ) ( ccccc ) ( ddddd ) ( eeeee ) ( ffffff ) g
" command │   ││└2Il)┘│││││└Il)┘│││││└─I)┘│││││└In)┘│││││└2In)┘│││
"         │   │└─2il)─┘│││└─il)─┘│││└──i)─┘│││└─in)─┘│││└─2in)─┘││
"         │   ├──2al)──┘│├──al)──┘│├───a)──┘│├──an)──┘│├──2an)──┘│
"         │   └──2Al)───┘└──Al)───┘└───A)───┘└──An)───┘└──2An)───┘
" cursor  │                          .........
" line    │ a ( b ( cccccc ) d ) ( e ( fffff ) g ) ( h ( iiiiii ) j ) k
" command │   │││ ││└2Il)┘││││││││││ ││└─I)┘││││││││││ ││└2In)┘│││││││
"         │   │││ │└─2il)─┘│││││││││ │└──i)─┘│││││││││ │└─2in)─┘││││││
"         │   │││ ├──2al)──┘││││││││ ├───a)──┘││││││││ ├──2an)──┘│││││
"         │   │││ └──2Al)───┘│││││││ └───A)───┘│││││││ └──2An)───┘││││
"         │   ││└─────Il)────┘│││││└────2I)────┘│││││└─────In)────┘│││
"         │   │└──────il)─────┘│││└─────2i)─────┘│││└──────in)─────┘││
"         │   ├───────al)──────┘│├──────2a)──────┘│├───────an)──────┘│
"         │   └───────Al)───────┘└──────2A)───────┘└───────An)───────┘
function! s:createPairTextObjects(mapType)
    for trigger in split(g:targets_pairs, '\zs')
        if trigger ==# ' '
            continue
        endif
        let triggerMap = trigger . " :<C-U>call targets#" . a:mapType . "('" . trigger
        call s:addMapping1(a:mapType, triggerMap . "ci', v:count1)<CR>", s:i)
        call s:addMapping1(a:mapType, triggerMap . "ca', v:count1)<CR>", s:a)
        call s:addMapping1(a:mapType, triggerMap . "cI', v:count1)<CR>", s:I)
        call s:addMapping1(a:mapType, triggerMap . "cA', v:count1)<CR>", s:A)
        call s:addMapping2(a:mapType, triggerMap . "ni', v:count1)<CR>", s:i, s:n)
        call s:addMapping2(a:mapType, triggerMap . "na', v:count1)<CR>", s:a, s:n)
        call s:addMapping2(a:mapType, triggerMap . "nI', v:count1)<CR>", s:I, s:n)
        call s:addMapping2(a:mapType, triggerMap . "nA', v:count1)<CR>", s:A, s:n)
        call s:addMapping2(a:mapType, triggerMap . "li', v:count1)<CR>", s:i, s:l)
        call s:addMapping2(a:mapType, triggerMap . "la', v:count1)<CR>", s:a, s:l)
        call s:addMapping2(a:mapType, triggerMap . "lI', v:count1)<CR>", s:I, s:l)
        call s:addMapping2(a:mapType, triggerMap . "lA', v:count1)<CR>", s:A, s:l)
    endfor
endfunction

" tag text objects work on tags (similar to pair text objects)
function! s:createTagTextObjects(mapType)
    let trigger = g:targets_tagTrigger
    let triggerMap = trigger . " :<C-U>call targets#" . a:mapType . "('" . trigger
    call s:addMapping1(a:mapType, triggerMap . "ci', v:count1)<CR>", s:i)
    call s:addMapping1(a:mapType, triggerMap . "ca', v:count1)<CR>", s:a)
    call s:addMapping1(a:mapType, triggerMap . "cI', v:count1)<CR>", s:I)
    call s:addMapping1(a:mapType, triggerMap . "cA', v:count1)<CR>", s:A)
    call s:addMapping2(a:mapType, triggerMap . "ni', v:count1)<CR>", s:i, s:n)
    call s:addMapping2(a:mapType, triggerMap . "na', v:count1)<CR>", s:a, s:n)
    call s:addMapping2(a:mapType, triggerMap . "nI', v:count1)<CR>", s:I, s:n)
    call s:addMapping2(a:mapType, triggerMap . "nA', v:count1)<CR>", s:A, s:n)
    call s:addMapping2(a:mapType, triggerMap . "li', v:count1)<CR>", s:i, s:l)
    call s:addMapping2(a:mapType, triggerMap . "la', v:count1)<CR>", s:a, s:l)
    call s:addMapping2(a:mapType, triggerMap . "lI', v:count1)<CR>", s:I, s:l)
    call s:addMapping2(a:mapType, triggerMap . "lA', v:count1)<CR>", s:A, s:l)
endfunction

" quote text objects expand into quote (by counting quote signs)
" `aN'` is a shortcut for `2an'` to jump from within one quote into the
" next one, instead of the quote in between
" cursor  │                   ........
" line    │ a ' bbbbb ' ccccc ' dddd ' eeeee ' fffff ' g
" command │   ││└IL'┘│││└Il'┘│││└I'┘│││└In'┘│││└IN'┘│││
"         │   │└─iL'─┘│├─il'─┘│├─i'─┘│├─in'─┘│├─iN'─┘││
"         │   ├──aL'──┤│      ├┼─a'──┤│      ├┼─aN'──┘│
"         │   └──AL'──┼┘      ├┼─A'──┼┘      ├┼─AN'───┘
"         │           ├──al'──┘│     ├──an'──┘│
"         │           └──Al'───┘     └──An'───┘
" cursor  │ ..........      │      ......      │      ..........
" line    │ a ' bbbb ' c '' │ ' a ' bbbb ' c ' │ '' b ' cccc ' d
" command │   ││└I'┘│││     │     ││└I'┘│││    │      ││└I'┘│││
"         │   │└─i'─┘││     │     │└─i'─┘││    │      │└─i'─┘││
"         │   ├──a'──┘│     │     ├──a'──┘│    │      ├──a'──┘│
"         │   └──A'───┘     │     └──A'───┘    │      └──A'───┘
function! s:createQuoteTextObjects(mapType)
    " quote text objects
    for trigger in split(g:targets_quotes, '\zs')
        if trigger ==# " "
            continue
        elseif trigger ==# "'"
            let triggerMap = "' :<C-U>call targets#" . a:mapType . "('''"
        else
            let triggerMap = trigger . " :<C-U>call targets#" . a:mapType . "('" . trigger
        endif
        call s:addMapping1(a:mapType, triggerMap . "ci', v:count1)<CR>", s:i)
        call s:addMapping1(a:mapType, triggerMap . "ca', v:count1)<CR>", s:a)
        call s:addMapping1(a:mapType, triggerMap . "cI', v:count1)<CR>", s:I)
        call s:addMapping1(a:mapType, triggerMap . "cA', v:count1)<CR>", s:A)
        call s:addMapping2(a:mapType, triggerMap . "ni', v:count1)<CR>", s:i, s:n)
        call s:addMapping2(a:mapType, triggerMap . "na', v:count1)<CR>", s:a, s:n)
        call s:addMapping2(a:mapType, triggerMap . "nI', v:count1)<CR>", s:I, s:n)
        call s:addMapping2(a:mapType, triggerMap . "nA', v:count1)<CR>", s:A, s:n)
        call s:addMapping2(a:mapType, triggerMap . "li', v:count1)<CR>", s:i, s:l)
        call s:addMapping2(a:mapType, triggerMap . "la', v:count1)<CR>", s:a, s:l)
        call s:addMapping2(a:mapType, triggerMap . "lI', v:count1)<CR>", s:I, s:l)
        call s:addMapping2(a:mapType, triggerMap . "lA', v:count1)<CR>", s:A, s:l)
        call s:addMapping2(a:mapType, triggerMap . "Ni', v:count1)<CR>", s:i, s:N)
        call s:addMapping2(a:mapType, triggerMap . "Na', v:count1)<CR>", s:a, s:N)
        call s:addMapping2(a:mapType, triggerMap . "NI', v:count1)<CR>", s:I, s:N)
        call s:addMapping2(a:mapType, triggerMap . "NA', v:count1)<CR>", s:A, s:N)
        call s:addMapping2(a:mapType, triggerMap . "Li', v:count1)<CR>", s:i, s:L)
        call s:addMapping2(a:mapType, triggerMap . "La', v:count1)<CR>", s:a, s:L)
        call s:addMapping2(a:mapType, triggerMap . "LI', v:count1)<CR>", s:I, s:L)
        call s:addMapping2(a:mapType, triggerMap . "LA', v:count1)<CR>", s:A, s:L)
    endfor
endfunction

" separator text objects expand to the right
" cursor  |                   ........
" line    │ a , bbbbb , ccccc , ddddd , eeeee , fffff , g
" command │   ││└IL,┘│││└Il,┘│││└ I,┘│││└In,┘│││└IN,┘│ │
"         │   │└─iL,─┤│├─il,─┤│├─ i,─┤│├─in,─┤│├─iN,─┤ │
"         │   ├──aL,─┘├┼─al,─┘├┼─ a,─┘├┼─an,─┘├┼─aN,─┘ │
"         │   └──AL,──┼┘      └┼─ A,──┼┘      └┼─AN,───┘
"         │           └─ Al, ──┘      └─ An, ──┘
" cursor  │ .........        │       ..........
" line    │ a , bbbb , c , d │ a , b , cccc , d
" command │   ││└I,┘│ │      │       ││└I,┘│ │
"         │   │└─i,─┤ │      │       │└─i,─┤ │
"         │   ├──a,─┘ │      │       ├──a,─┘ │
"         │   └──A,───┘      │       └──A,───┘
function! s:createSeparatorTextObjects(mapType)
    " separator text objects
    for trigger in split(g:targets_separators, '\zs')
        if trigger ==# ' '
            continue
        elseif trigger ==# '|'
            let trigger = '\|'
        endif
        let triggerMap = trigger . " :<C-U>call targets#" . a:mapType . "('" . trigger
        call s:addMapping1(a:mapType, triggerMap . "ci', v:count1)<CR>", s:i)
        call s:addMapping1(a:mapType, triggerMap . "ca', v:count1)<CR>", s:a)
        call s:addMapping1(a:mapType, triggerMap . "cI', v:count1)<CR>", s:I)
        call s:addMapping1(a:mapType, triggerMap . "cA', v:count1)<CR>", s:A)
        call s:addMapping2(a:mapType, triggerMap . "ni', v:count1)<CR>", s:i, s:n)
        call s:addMapping2(a:mapType, triggerMap . "na', v:count1)<CR>", s:a, s:n)
        call s:addMapping2(a:mapType, triggerMap . "nI', v:count1)<CR>", s:I, s:n)
        call s:addMapping2(a:mapType, triggerMap . "nA', v:count1)<CR>", s:A, s:n)
        call s:addMapping2(a:mapType, triggerMap . "li', v:count1)<CR>", s:i, s:l)
        call s:addMapping2(a:mapType, triggerMap . "la', v:count1)<CR>", s:a, s:l)
        call s:addMapping2(a:mapType, triggerMap . "lI', v:count1)<CR>", s:I, s:l)
        call s:addMapping2(a:mapType, triggerMap . "lA', v:count1)<CR>", s:A, s:l)
        call s:addMapping2(a:mapType, triggerMap . "Ni', v:count1)<CR>", s:i, s:N)
        call s:addMapping2(a:mapType, triggerMap . "Na', v:count1)<CR>", s:a, s:N)
        call s:addMapping2(a:mapType, triggerMap . "NI', v:count1)<CR>", s:I, s:N)
        call s:addMapping2(a:mapType, triggerMap . "NA', v:count1)<CR>", s:A, s:N)
        call s:addMapping2(a:mapType, triggerMap . "Li', v:count1)<CR>", s:i, s:L)
        call s:addMapping2(a:mapType, triggerMap . "La', v:count1)<CR>", s:a, s:L)
        call s:addMapping2(a:mapType, triggerMap . "LI', v:count1)<CR>", s:I, s:L)
        call s:addMapping2(a:mapType, triggerMap . "LA', v:count1)<CR>", s:A, s:L)
    endfor
endfunction

" argument text objects expand to the right
" cursor  |                          .........
" line    │ a ( bbbbbb , ccccccc , d ( eeeeee , fffffff ) , gggggg ) h
" command │   ││├2Ila┘│││└─Ila─┘││││ ││├─Ia─┘│││└─Ina─┘│││││└2Ina┘│ │
"         │   │└┼2ila─┘│├──ila──┤│││ │└┼─ia──┘│├──ina──┤│││├─2ina─┤ │
"         │   │ └2ala──┼┤       ││││ │ └─aa───┼┤       │││├┼─2ana─┘ │
"         │   └──2Ala──┼┘       ││││ └───Aa───┼┘       │││└┼─2Ana───┘
"         │            ├───ala──┘│││          ├───ana──┘││ │
"         │            └───Ala───┼┤│          └───Ana───┼┤ │
"         │                      ││└─────2Ia────────────┘│ │
"         │                      │└──────2ia─────────────┤ │
"         │                      ├───────2aa─────────────┘ │
"         │                      └───────2Aa───────────────┘
function! s:createArgTextObjects(mapType)
    let trigger = g:targets_argTrigger
    let triggerMap = trigger . " :<C-U>call targets#" . a:mapType . "('" . trigger
    call s:addMapping1(a:mapType, triggerMap . "ci', v:count1)<CR>", s:i)
    call s:addMapping1(a:mapType, triggerMap . "ca', v:count1)<CR>", s:a)
    call s:addMapping1(a:mapType, triggerMap . "cI', v:count1)<CR>", s:I)
    call s:addMapping1(a:mapType, triggerMap . "cA', v:count1)<CR>", s:A)
    call s:addMapping2(a:mapType, triggerMap . "ni', v:count1)<CR>", s:i, s:n)
    call s:addMapping2(a:mapType, triggerMap . "na', v:count1)<CR>", s:a, s:n)
    call s:addMapping2(a:mapType, triggerMap . "nI', v:count1)<CR>", s:I, s:n)
    call s:addMapping2(a:mapType, triggerMap . "nA', v:count1)<CR>", s:A, s:n)
    call s:addMapping2(a:mapType, triggerMap . "li', v:count1)<CR>", s:i, s:l)
    call s:addMapping2(a:mapType, triggerMap . "la', v:count1)<CR>", s:a, s:l)
    call s:addMapping2(a:mapType, triggerMap . "lI', v:count1)<CR>", s:I, s:l)
    call s:addMapping2(a:mapType, triggerMap . "lA', v:count1)<CR>", s:A, s:l)
endfunction

" add expression mappings for `A` and `I` in visual mode #23 unless
" deactivated #49. Manually make mappings for older verions of vim #117.
function! s:addVisualMappings()
    if v:version >= 704 || (v:version == 703 && has('patch338'))
        silent! execute 'xnoremap <expr> <silent> <unique> ' . s:i . " targets#e('i')"
        silent! execute 'xnoremap <expr> <silent> <unique> ' . s:a . " targets#e('a')"
        silent! execute 'xnoremap <expr> <silent> <unique> ' . s:I . " targets#e('I')"
        silent! execute 'xnoremap <expr> <silent> <unique> ' . s:A . " targets#e('A')"
    else
        call s:createPairTextObjects('x')
        call s:createTagTextObjects('x')
        call s:createQuoteTextObjects('x')
        call s:createSeparatorTextObjects('x')
        call s:createArgTextObjects('x')
    endif
endfunction

function! s:loadSettings()
    if !exists('g:targets_aiAI')
        let g:targets_aiAI = 'aiAI'
    endif
    if !exists('g:targets_nlNL')
        let g:targets_nlNL = 'nlNL'
    endif
    if !exists('g:targets_pairs')
        let g:targets_pairs = '()b {}B [] <>'
    endif
    if !exists('g:targets_quotes')
        let g:targets_quotes = '" '' `'
    endif
    if !exists('g:targets_separators')
        let g:targets_separators = ', . ; : + - = ~ _ * # / \ | & $'
    endif
    if !exists('g:targets_tagTrigger')
        let g:targets_tagTrigger = 't'
    endif
    if !exists('g:targets_argTrigger')
        let g:targets_argTrigger = 'a'
    endif
    if !exists('g:targets_argOpening')
        let g:targets_argOpening = '[([]'
    endif
    if !exists('g:targets_argClosing')
        let g:targets_argClosing = '[])]'
    endif
    if !exists('g:targets_argSeparator')
        let g:targets_argSeparator = ','
    endif
    if !exists('g:targets_seekRanges')
        let g:targets_seekRanges = 'cr cb cB lc ac Ac lr rr ll lb ar ab lB Ar aB Ab AB rb al rB Al bb aa bB Aa BB AA'
    endif
    if !exists('g:targets_jumpRanges')
        let g:targets_jumpRanges = 'bb bB BB aa Aa AA'
    endif

    let [s:a, s:i, s:A, s:I] = split(g:targets_aiAI, '\zs')
    let [s:n, s:l, s:N, s:L] = split(g:targets_nlNL, '\zs')
endfunction

call s:loadSettings()

" create the text objects (current total count: 528)
call s:createPairTextObjects('o')
call s:createTagTextObjects('o')
call s:createQuoteTextObjects('o')
call s:createSeparatorTextObjects('o')
call s:createArgTextObjects('o')
call s:addVisualMappings()

let &cpoptions = s:save_cpoptions
unlet s:save_cpoptions
