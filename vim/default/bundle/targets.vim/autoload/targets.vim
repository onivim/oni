" targets.vim Provides additional text objects
" Author:  Christian Wellenbrock <christian.wellenbrock@gmail.com>
" License: MIT license

" save cpoptions
let s:save_cpoptions = &cpoptions
set cpo&vim

" called once when loaded
function! s:setup()
    let s:argOpeningS = g:targets_argOpening . '\|' . g:targets_argSeparator
    let s:argClosingS = g:targets_argClosing . '\|' . g:targets_argSeparator
    let s:argOuter    = g:targets_argOpening . '\|' . g:targets_argClosing
    let s:argAll      = s:argOpeningS        . '\|' . g:targets_argClosing
    let s:none        = 'a^' " matches nothing

    let s:rangeScores = {}
    let ranges = split(g:targets_seekRanges)
    let rangesN = len(ranges)
    let i = 0
    while i < rangesN
        let s:rangeScores[ranges[i]] = rangesN - i
        let i = i + 1
    endwhile

    let s:rangeJumps = {}
    let ranges = split(g:targets_jumpRanges)
    let rangesN = len(ranges)
    let i = 0
    while i < rangesN
        let s:rangeJumps[ranges[i]] = 1
        let i = i + 1
    endwhile
endfunction

call s:setup()

" a:count is unused here, but added for consistency with targets#x
function! targets#o(trigger, count)
    call s:init('o')
    let [delimiter, which, modifier] = split(a:trigger, '\zs')
    let [target, rawTarget] = s:findTarget(delimiter, which, modifier, v:count1)
    if target.state().isInvalid()
        return s:cleanUp()
    endif
    call s:handleTarget(target, rawTarget)
    call s:clearCommandLine()
    call s:prepareRepeat(delimiter, which, modifier)
    call s:cleanUp()
endfunction

function! targets#e(modifier)
    if mode() !=? 'v'
        return a:modifier
    endif

    let char1 = nr2char(getchar())
    let [delimiter, which, chars] = [char1, 'c', char1]
    let i = 0
    while i < 4
        if g:targets_nlNL[i] ==# delimiter
            " delimiter was which, get another char for delimiter
            let char2 = nr2char(getchar())
            let [delimiter, which, chars] = [char2, 'nlNL'[i], chars . char2]
            break
        endif
        let i = i + 1
    endwhile

    let [_, _, _, err] = s:getDelimiters(delimiter)
    if err
        return a:modifier . chars
    endif

    if delimiter ==# "'"
        let delimiter = "''"
    endif

    return "\<Esc>:\<C-U>call targets#x('" . delimiter . which . a:modifier . "', " . v:count1 . ")\<CR>"
endfunction

function! targets#x(trigger, count)
    call s:initX(a:trigger)

    let [delimiter, which, modifier] = split(a:trigger, '\zs')
    let [target, rawTarget] = s:findTarget(delimiter, which, modifier, a:count)
    if target.state().isInvalid()
        call s:abortMatch('#x')
        return s:cleanUp()
    endif
    if s:handleTarget(target, rawTarget) == 0
        let s:lastTrigger = a:trigger
        let s:lastRawTarget = rawTarget
        let s:lastTarget = target
    endif
    call s:cleanUp()
endfunction

" initialize script local variables for the current matching
function! s:init(mapmode)
    let s:mapmode = a:mapmode
    let s:oldpos = getpos('.')
    let s:newSelection = 1
    let s:shouldGrow = 1

    let s:selection = &selection " remember 'selection' setting
    let &selection = 'inclusive' " and set it to inclusive

    let s:virtualedit = &virtualedit " remember 'virtualedit' setting
    let &virtualedit = ''            " and set it to default
endfunction

" save old visual selection to detect new selections and reselect on fail
function! s:initX(trigger)
    call s:init('x')

    let s:visualTarget = targets#target#fromVisualSelection()

    " reselect, save mode and go back to normal mode
    normal! gv
    if mode() ==# 'V'
        let s:visualTarget.linewise = 1
        normal! V
    else
        normal! v
    endif

    let s:newSelection = s:isNewSelection()
    let s:shouldGrow = s:shouldGrow(a:trigger)
endfunction

" clean up script variables after match
function! s:cleanUp()
    " reset remembered settings
    let &selection = s:selection
    let &virtualedit = s:virtualedit
endfunction

function! s:findTarget(delimiter, which, modifier, count)
    let [kind, s:opening, s:closing, err] = s:getDelimiters(a:delimiter)
    if err
        let errorTarget = targets#target#withError("failed to find delimiter")
        return [errorTarget, errorTarget]
    endif

    let view = winsaveview()
    let rawTarget = s:findRawTarget(kind, a:which, a:count)
    let target = s:modifyTarget(rawTarget, kind, a:modifier)
    call winrestview(view)
    return [target, rawTarget]
endfunction

function! s:findRawTarget(kind, which, count)
    if a:kind ==# 'p'
        if a:which ==# 'c'
            return s:seekselectp(a:count + s:grow())
        elseif a:which ==# 'n'
            call s:nextp(a:count)
            return s:selectp()
        elseif a:which ==# 'l'
            call s:lastp(a:count)
            return s:selectp()
        else
            return targets#target#withError('findRawTarget p')
        endif

    elseif a:kind ==# 'q'
        if a:which ==# 'c'
            call s:quote()
            return s:seekselect()
        elseif a:which ==# 'n'
            call s:quote()
            return s:nextselect(a:count)
        elseif a:which ==# 'l'
            call s:quote()
            return s:lastselect(a:count)
        elseif a:which ==# 'N'
            call s:quote()
            return s:nextselect(a:count * 2)
        elseif a:which ==# 'L'
            call s:quote()
            return s:lastselect(a:count * 2)
        else
            return targets#target#withError('findRawTarget q')
        endif

    elseif a:kind ==# 's'
        if a:which ==# 'c'
            return s:seekselect()
        elseif a:which ==# 'n'
            return s:nextselect(a:count)
        elseif a:which ==# 'l'
            return s:lastselect(a:count)
        elseif a:which ==# 'N'
            return s:nextselect(a:count * 2)
        elseif a:which ==# 'L'
            return s:lastselect(a:count * 2)
        else
            return targets#target#withError('findRawTarget s')
        endif

    elseif a:kind ==# 't'
        if a:which ==# 'c'
            return s:seekselectt(a:count + s:grow())
        elseif a:which ==# 'n'
            call s:nextt(a:count)
            return s:selectp()
        elseif a:which ==# 'l'
            call s:lastt(a:count)
            return s:selectp()
        else
            return targets#target#withError('findRawTarget t')
        endif

    elseif a:kind ==# 'a'
        if a:which ==# 'c'
            return s:seekselecta(a:count + s:grow())
        elseif a:which ==# 'n'
            return s:nextselecta(a:count)
        elseif a:which ==# 'l'
            return s:lastselecta(a:count)
        else
            return targets#target#withError('findRawTarget a')
        endif
    endif

    return targets#target#withError('findRawTarget kind')
endfunction

function! s:modifyTarget(target, kind, modifier)
    if a:target.state().isInvalid()
        return targets#target#withError('modifyTarget invalid')
    endif
    let target = a:target.copy()

    if a:kind ==# 'p'
        if a:modifier ==# 'i'
            return s:drop(target)
        elseif a:modifier ==# 'a'
            return target
        elseif a:modifier ==# 'I'
            return s:shrink(target)
        elseif a:modifier ==# 'A'
            return s:expand(target)
        else
            return targets#target#withError('modifyTarget p')
        endif

    elseif a:kind ==# 'q'
        if a:modifier ==# 'i'
            return s:drop(target)
        elseif a:modifier ==# 'a'
            return target
        elseif a:modifier ==# 'I'
            return s:shrink(target)
        elseif a:modifier ==# 'A'
            return s:expand(target)
        else
            return targets#target#withError('modifyTarget q')
        endif

    elseif a:kind ==# 's'
        if a:modifier ==# 'i'
            return s:drop(target)
        elseif a:modifier ==# 'a'
            return s:dropr(target)
        elseif a:modifier ==# 'I'
            return s:shrink(target)
        elseif a:modifier ==# 'A'
            return s:expand(target)
        else
            return targets#target#withError('modifyTarget s')
        endif

    elseif a:kind ==# 't'
        if a:modifier ==# 'i'
            let target = s:innert(target)
            return s:drop(target)
        elseif a:modifier ==# 'a'
            return target
        elseif a:modifier ==# 'I'
            let target = s:innert(target)
            return s:shrink(target)
        elseif a:modifier ==# 'A'
            return s:expand(target)
        else
            return targets#target#withError('modifyTarget t')
        endif

    elseif a:kind ==# 'a'
        if a:modifier ==# 'i'
            return s:drop(target)
        elseif a:modifier ==# 'a'
            return s:dropa(target)
        elseif a:modifier ==# 'I'
            return s:shrink(target)
        elseif a:modifier ==# 'A'
            return s:expand(target)
        else
            return targets#target#withError('modifyTarget a')
        endif
    endif

    return targets#target#withError('modifyTarget kind')
endfunction

function! s:getDelimiters(trigger)
    " create cache
    if !exists('s:delimiterCache')
        let s:delimiterCache = {}
    endif

    " check cache
    if has_key(s:delimiterCache, a:trigger)
        let [kind, opening, closing] = s:delimiterCache[a:trigger]
        return [kind, opening, closing, 0]
    endif

    let [kind, rawOpening, rawClosing, err] = s:getRawDelimiters(a:trigger)
    if err > 0
        return [0, 0, 0, err]
    endif

    let opening = s:modifyDelimiter(kind, rawOpening)
    let closing = s:modifyDelimiter(kind, rawClosing)

    " write to cache
    let s:delimiterCache[a:trigger] = [kind, opening, closing]

    return [kind, opening, closing, 0]
endfunction

function! s:getRawDelimiters(trigger)
    for pair in split(g:targets_pairs)
        for trigger in split(pair, '\zs')
            if trigger ==# a:trigger
                return ['p', pair[0], pair[1], 0]
            endif
        endfor
    endfor

    for quote in split(g:targets_quotes)
        for trigger in split(quote, '\zs')
            if trigger ==# a:trigger
                return ['q', quote[0], quote[0], 0]
            endif
        endfor
    endfor

    for separator in split(g:targets_separators)
        for trigger in split(separator, '\zs')
            if trigger ==# a:trigger
                return ['s', separator[0], separator[0], 0]
            endif
        endfor
    endfor

    if a:trigger ==# g:targets_tagTrigger
        return ['t', 't', 0, 0] " TODO: set tag patterns here and remove special tag functions?
    elseif a:trigger ==# g:targets_argTrigger
        return ['a', 0, 0, 0]
    else
        return [0, 0, 0, 1]
    endif
endfunction

function! s:modifyDelimiter(kind, delimiter)
    let delimiter = escape(a:delimiter, '.~\$')
    if a:kind !=# 'q' || &quoteescape ==# ''
        return delimiter
    endif

    let escapedqe = escape(&quoteescape, ']^-\')
    let lookbehind = '[' . escapedqe . ']'
    if v:version >= 704
        return lookbehind . '\@1<!' . delimiter
    else
        return lookbehind . '\@<!'  . delimiter
    endif
endfunction

" return 0 if the selection changed since the last invocation. used for
" growing
function! s:isNewSelection()
    " no previous invocation or target
    if !exists('s:lastTarget')
        return 1
    endif

    " selection changed
    if s:lastTarget != s:visualTarget
        return 1
    endif

    return 0
endfunction

function! s:shouldGrow(trigger)
    if s:newSelection
        return 0
    endif

    if !exists('s:lastTrigger')
        return 0
    endif

    if s:lastTrigger != a:trigger
        return 0
    endif

    return 1
endfunction

" clear the commandline to hide targets function calls
function! s:clearCommandLine()
    echo
endfunction

" handle the match by either selecting or aborting it
function! s:handleTarget(target, rawTarget)
    if a:target.state().isInvalid()
        return s:abortMatch('handleTarget')
    elseif a:target.state().isEmpty()
        return s:handleEmptyMatch(a:target)
    else
        return s:selectTarget(a:target, a:rawTarget)
    endif
endfunction

" select a proper match
function! s:selectTarget(target, rawTarget)
    " add old position to jump list
    if s:addToJumplist(a:rawTarget)
        call setpos('.', s:oldpos)
        normal! m'
    endif

    call s:selectRegion(a:target)
endfunction

function! s:addToJumplist(target)
    let min = line('w0')
    let max = line('w$')
    let range = a:target.range(s:oldpos, min, max)
    return get(s:rangeJumps, range)
endfunction

" visually select a given match. used for match or old selection
function! s:selectRegion(target)
    " visually select the target
    call a:target.select()

    " if selection should be exclusive, expand selection
    if s:selection ==# 'exclusive'
        normal! l
    endif
endfunction

" empty matches can't visually be selected
" most operators would like to move to the end delimiter
" for change or delete, insert temporary character that will be operated on
function! s:handleEmptyMatch(target)
    if s:mapmode !=# 'o' || v:operator !~# "^[cd]$"
        return s:abortMatch('handleEmptyMatch')
    endif

    " move cursor to delimiter after zero width match
    call a:target.cursorS()

    let eventignore = &eventignore " remember setting
    let &eventignore = 'all' " disable auto commands

    " insert single space and visually select it
    silent! execute "normal! i \<Esc>v"

    let &eventignore = eventignore " restore setting
endfunction

" abort when no match was found
function! s:abortMatch(message)
    " get into normal mode and beep
    if !exists("*getcmdwintype") || getcmdwintype() ==# ""
        call feedkeys("\<C-\>\<C-N>\<Esc>", 'n')
    endif

    call s:prepareReselect()
    call setpos('.', s:oldpos)

    " undo partial command
    call s:triggerUndo()
    " trigger reselect if called from xmap
    call s:triggerReselect()

    return s:fail(a:message)
endfunction

" feed keys to call undo after aborted operation and clear the command line
function! s:triggerUndo()
    if exists("*undotree")
        let undoseq = undotree().seq_cur
        call feedkeys(":call targets#undo(" . undoseq . ")\<CR>:echo\<CR>", 'n')
    endif
endfunction

" temporarily select original selection to reselect later
function! s:prepareReselect()
    if s:mapmode ==# 'x'
        call s:selectRegion(s:visualTarget)
    endif
endfunction

" feed keys to reselect the last visual selection if called with mapmode x
function! s:triggerReselect()
    if s:mapmode ==# 'x'
        call feedkeys("gv", 'n')
    endif
endfunction

" set up repeat.vim for older Vim versions
function! s:prepareRepeat(delimiter, which, modifier)
    if v:version >= 704 " skip recent versions
        return
    endif

    if v:operator ==# 'y' && match(&cpoptions, 'y') ==# -1 " skip yank unless set up
        return
    endif

    let cmd = v:operator . a:modifier
    if a:which !=# 'c'
        let cmd .= a:which
    endif
    let cmd .= a:delimiter
    if v:operator ==# 'c'
        let cmd .= "\<C-r>.\<ESC>"
    endif

    silent! call repeat#set(cmd, v:count)
endfunction

" undo last operation if it created a new undo position
function! targets#undo(lastseq)
    if undotree().seq_cur > a:lastseq
        silent! execute "normal! u"
    endif
endfunction

" position modifiers
" ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯

" move the cursor inside of a proper quote when positioned on a delimiter
" (move one character to the left when over an odd number of quotation mark)
" the number of delimiters to the left of the cursor is counted to decide
" if this is an opening or closing quote delimiter
" in   │ . │  . │ . │  .
" line │ ' │  ' │ ' │  '
" out  │ . │ .  │ . │ .
function! s:quote()
    if s:getchar() !=# s:opening
        return
    endif

    let oldpos = getpos('.')
    let closing = 1
    let line = 1
    while line != 0
        let line = searchpos(s:opening, 'b', line('.'))[0]
        let closing = !closing
    endwhile
    call setpos('.', oldpos)
    if closing " cursor is on closing delimiter
        silent! normal! h
    endif
endfunction

" find `count` next delimiter (multi line)
" in   │     ...
" line │  '  '  '  '
" out  │        1  2
" args (count=1)
function! s:nextselect(...)
    let cnt = a:0 == 1 ? a:1 : 1

    call s:prepareNext()

    if s:search(cnt, s:opening, 'W') > 0
        return targets#target#withError('nextselect')
    endif

    return s:select('>')
endfunction

" find `count` last delimiter, move in front of it (multi line)
" in   │     ...
" line │  '  '  '  '
" out  │ 2  1
" args (count=1)
function! s:lastselect(...)
    let cnt = a:0 == 1 ? a:1 : 1

    " if started on closing, but not when skipping
    if !s:prepareLast() && s:getchar() ==# s:closing
        let [cnt, message] = [cnt - 1, 'lastselect 1']
    else
        let [cnt, message] = [cnt, 'lastselect 2']
    endif

    if s:search(cnt, s:closing, 'bW') > 0
        return targets#target#withError(message)
    endif

    return s:select('<')
endfunction

" find `count` next opening delimiter (multi line)
" in   │ ....
" line │ ( ) ( ) ( ( ) ) ( )
" out  │     1   2 3     4
function! s:nextp(count)
    call s:prepareNext()
    return s:search(a:count, s:opening, 'W')
endfunction

" find `count` last closing delimiter (multi line)
" in   │               ....
" line │ ( ) ( ) ( ( ) ) ( )
" out  │   4   3     2 1
function! s:lastp(count)
    call s:prepareLast()
    return s:search(a:count, s:closing, 'bW')
endfunction

" find `count` next opening tag delimiter (multi line)
" in   │ .........
" line │ <a> </a> <b> </b> <c> <d> </d> </c> <e> </e>
" out  │          1        2   3             4
function! s:nextt(count)
    call s:prepareNext()
    return s:search(a:count, '<\a', 'W')
endfunction

" find `count` last closing tag delimiter (multi line)
" in   │                                    .........
" line │ <a> </a> <b> </b> <c> <d> </d> </c> <e> </e>
" out  │     4        3            2    1
function! s:lastt(count)
    call s:prepareLast()
    return s:search(a:count, '</\a\zs', 'bW')
endfunction

" match selectors
" ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯

" select pair of delimiters around cursor (multi line, no seeking)
" select to the right if cursor is on a delimiter
" cursor  │   ....
" line    │ ' ' b ' '
" matcher │   └───┘
function! s:select(direction)
    let oldpos = getpos('.')

    if a:direction ==# '>'
        let [sl, sc, el, ec, err] = s:findSeparators('bcW', 'W', s:opening, s:closing)
        let message = 'select 1'
    else
        let [el, ec, sl, sc, err] = s:findSeparators('cW', 'bW', s:closing, s:opening)
        let message = 'select 2'
    endif

    if err > 0
        call setpos('.', oldpos)
        return targets#target#withError(message)
    endif

    let target = targets#target#fromValues(sl, sc, el, ec)
    return target
endfunction

" TODO: inject direction and return proper target
" find separators around cursor by searching for opening with flags1 and for
" closing with flags2
function! s:findSeparators(flags1, flags2, opening, closing)
    let [sl, sc] = searchpos(a:opening, a:flags1)
    if sc == 0 " no match to the left
        return [0, 0, 0, 0, s:fail('findSeparators 1')]
    endif

    let [el, ec] = searchpos(a:closing, a:flags2)
    if ec == 0 " no match to the right
        return [0, 0, 0, 0, s:fail('findSeparators 2')]
    endif

    return [sl, sc, el, ec, 0]
endfunction

" select pair of delimiters around cursor (multi line, supports seeking)
function! s:seekselect()
    let min = line('w0')
    let max = line('w$')
    let oldpos = getpos('.')

    let around = s:select('>')

    call setpos('.', oldpos)

    let last = s:lastselect()

    call setpos('.', oldpos)

    let next = s:nextselect()

    return s:bestSeekTarget([around, next, last], oldpos, min, max, 'seekselect')
endfunction

" select a pair around the cursor
" args (count=1, trigger=s:opening)
function! s:selectp(...)
    if a:0 == 2
        let [cnt, trigger] = [a:1, a:2]
    else
        let [cnt, trigger] = [1, s:opening]
    endif

    " try to select pair
    silent! execute 'keepjumps normal! v' . cnt . 'a' . trigger
    let [el, ec] = getpos('.')[1:2]
    silent! normal! o
    let [sl, sc] = getpos('.')[1:2]
    silent! normal! v

    if sc == ec && sl == el
        return targets#target#withError('selectp')
    endif

    return targets#target#fromValues(sl, sc, el, ec)
endfunction

" pair matcher (works across multiple lines, supports seeking)
" cursor   │   .....
" line     │ ( ( a ) )
" modifier │ │ └─1─┘ │
"          │ └── 2 ──┘
" args (count, opening=s:opening, closing=s:closing, trigger=s:closing)
function! s:seekselectp(...)
    if a:0 == 4
        let [cnt, opening, closing, trigger] = [a:1, a:2, a:3, a:4]
    else
        let [cnt, opening, closing, trigger] = [a:1, s:opening, s:closing, s:closing]
    endif

    let min = line('w0')
    let max = line('w$')
    let oldpos = getpos('.')

    let around = s:selectp(cnt, trigger)

    if cnt > 1 " don't seek with count
        return around
    endif

    call setpos('.', oldpos)

    call s:lastp(cnt)
    let last = s:selectp()

    call setpos('.', oldpos)

    call s:nextp(cnt)
    let next = s:selectp()

    return s:bestSeekTarget([around, next, last], oldpos, min, max, 'seekselectp')
endfunction

" tag pair matcher (works across multiple lines, supports seeking)
function! s:seekselectt(count)
    return s:seekselectp(a:count, '<\a', '</\a', 't')
endfunction

" select an argument around the cursor
" parameter direction decides where to select when invoked on a separator:
"   '>' select to the right (default)
"   '<' select to the left (used when selecting or skipping to the left)
"   '^' select up (surrounding argument, used for growing)
function! s:selecta(direction)
    let oldpos = getpos('.')

    let [opening, closing] = [g:targets_argOpening, g:targets_argClosing]
    if a:direction ==# '^'
        let [sl, sc, el, ec, err] = s:findArg(a:direction, 'W', 'bcW', 'bW', opening, closing)
        let message = 'selecta 1'
    elseif a:direction ==# '>'
        let [sl, sc, el, ec, err] = s:findArg(a:direction, 'W', 'bW', 'bW', opening, closing)
        let message = 'selecta 2'
    elseif a:direction ==# '<' " like '>', but backwards
        let [el, ec, sl, sc, err] = s:findArg(a:direction, 'bW', 'W', 'W', closing, opening)
        let message = 'selecta 3'
    else
        return targets#target#withError('selecta')
    endif

    if err > 0
        call setpos('.', oldpos)
        return targets#target#withError(message)
    endif

    return targets#target#fromValues(sl, sc, el, ec)
endfunction

" find an argument around the cursor given a direction (see s:selecta)
" uses flags1 to search for end to the right; flags1 and flags2 to search for
" start to the left
function! s:findArg(direction, flags1, flags2, flags3, opening, closing)
    let oldpos = getpos('.')
    let char = s:getchar()
    let separator = g:targets_argSeparator

    if char =~# a:closing && a:direction !=# '^' " started on closing, but not up
        let [el, ec] = oldpos[1:2] " use old position as end
    else " find end to the right
        let [el, ec, err] = s:findArgBoundary(a:flags1, a:flags1, a:opening, a:closing)
        if err > 0 " no closing found
            return [0, 0, 0, 0, s:fail('findArg 1', a:)]
        endif

        let separator = g:targets_argSeparator
        if char =~# a:opening || char =~# separator " started on opening or separator
            let [sl, sc] = oldpos[1:2] " use old position as start
            return [sl, sc, el, ec, 0]
        endif

        call setpos('.', oldpos) " return to old position
    endif

    " find start to the left
    let [sl, sc, err] = s:findArgBoundary(a:flags2, a:flags3, a:closing, a:opening)
    if err > 0 " no opening found
        return [0, 0, 0, 0, s:fail('findArg 2')]
    endif

    return [sl, sc, el, ec, 0]
endfunction

" find arg boundary by search for `finish` or `separator` while skipping
" matching `skip`s
" example: find ',' or ')' while skipping a pair when finding '('
" args (flags1, flags2, skip, finish, all=s:argAll,
" separator=g:targets_argSeparator, cnt=2)
" return (line, column, err)
function! s:findArgBoundary(...)
    let [flags1, flags2, skip, finish] = [a:1, a:2, a:3, a:4]
    if a:0 == 7
        let [all, separator, cnt] = [a:5, a:6, a:7]
    else
        let [all, separator, cnt] = [s:argAll, g:targets_argSeparator, 1]
    endif

    let tl = 0
    for _ in range(cnt)
        let [rl, rc] = searchpos(all, flags1)
        while 1
            if rl == 0
                return [0, 0, s:fail('findArgBoundary 1', a:)]
            endif

            let char = s:getchar()
            if char =~# separator
                if tl == 0
                    let [tl, tc] = [rl, rc]
                endif
            elseif char =~# finish
                if tl > 0
                    return [tl, tc, 0]
                endif
                break
            elseif char =~# skip
                silent! keepjumps normal! %
            else
                return [0, 0, s:fail('findArgBoundary 2')]
            endif
            let [rl, rc] = searchpos(all, flags2)
        endwhile
    endfor

    return [rl, rc, 0]
endfunction

" selects and argument, supports growing and seeking
function! s:seekselecta(count)
    if a:count > 1
        if s:getchar() =~# g:targets_argClosing
            let [cnt, message] = [a:count - 2, 'seekselecta 1']
        else
            let [cnt, message] = [a:count - 1, 'seekselecta 2']
        endif
        " find cnt closing while skipping matched openings
        let [opening, closing] = [g:targets_argOpening, g:targets_argClosing]
        if s:findArgBoundary('W', 'W', opening, closing, s:argOuter, s:none, cnt)[2] > 0
            return targets#target#withError(message . ' count')
        endif
        return s:selecta('^')
    endif

    let min = line('w0')
    let max = line('w$')
    let oldpos = getpos('.')

    let around = s:selecta('>')

    if a:count > 1 " don't seek with count
        return around
    endif

    call setpos('.', oldpos)

    let last = s:lastselecta()

    call setpos('.', oldpos)

    let next = s:nextselecta()

    return s:bestSeekTarget([around, next, last], oldpos, min, max, 'seekselecta')
endfunction

" try to select a next argument, supports count and optional stopline
" args (count=1, stopline=0)
function! s:nextselecta(...)
    let [cnt, stopline] = [a:0 > 0 ? a:1 : 1, a:0 > 1 ? a:2 : 0]
    call s:prepareNext()

    if s:search(cnt, s:argOpeningS, 'W', stopline) > 0 " no start found
        return targets#target#withError('nextselecta 1')
    endif

    let char = s:getchar()
    let target = s:selecta('>')
    if target.state().isValid()
        return target
    endif

    if char !~# g:targets_argSeparator " start wasn't on comma
        return targets#target#withError('nextselecta 2')
    endif

    call setpos('.', s:oldpos)
    let opening = g:targets_argOpening
    if s:search(cnt, opening, 'W', stopline) > 0 " no start found
        return targets#target#withError('nextselecta 3')
    endif

    let target = s:selecta('>')
    if target.state().isValid()
        return target
    endif

    return targets#target#withError('nextselecta 4')
endfunction

" try to select a last argument, supports count and optional stopline
" args (count=1, stopline=0)
function! s:lastselecta(...)
    let [cnt, stopline] = [a:0 > 0 ? a:1 : 1, a:0 > 1 ? a:2 : 0]

    call s:prepareLast()

    " special case to handle vala when invoked on a separator
    let separator = g:targets_argSeparator
    if s:getchar() =~# separator && s:newSelection
        let target = s:selecta('<')
        if target.state().isValid()
            return target
        endif
    endif

    if s:search(cnt, s:argClosingS, 'bW', stopline) > 0 " no start found
        return targets#target#withError('lastselecta 1')
    endif

    let char = s:getchar()
    let target = s:selecta('<')
    if target.state().isValid()
        return target
    endif

    if char !~# separator " start wasn't on separator
        return targets#target#withError('lastselecta 2')
    endif

    call setpos('.', s:oldpos)
    let closing = g:targets_argClosing
    if s:search(cnt, closing, 'bW', stopline) > 0 " no start found
        return targets#target#withError('lastselecta 3')
    endif

    let target = s:selecta('<')
    if target.state().isValid()
        return target
    endif

    return targets#target#withError('lastselecta 4')
endfunction

" select best of given targets according to s:rangeScores
" detects for each given target what range type it has, depending on the
" relative positions of the start and end of the target relative to the cursor
" position and the currently visible lines

" The possibly relative positions are:
"   c - on cursor position
"   l - left of cursor in current line
"   r - right of cursor in current line
"   a - above cursor on screen
"   b - below cursor on screen
"   A - above cursor off screen
"   B - below cursor off screen

" All possibly ranges are listed below, denoted by two characters: one for the
" relative start and for the relative end position each of the target. For
" example, `lr` means "from left of cursor to right of cursor in cursor line".

" Next to each range type is a pictogram of an example. They are made of these
" symbols:
"    .  - current cursor position
"   ( ) - start and end of target
"    /  - line break before and after cursor line
"    |  - screen edge between hidden and visible lines

" ranges on cursor:
"   cr   |  /  () /  |   starting on cursor, current line
"   cb   |  /  (  /) |   starting on cursor, multiline down, on screen
"   cB   |  /  (  /  |)  starting on cursor, multiline down, partially off screen
"   lc   |  / ()  /  |   ending on cursor, current line
"   ac   | (/  )  /  |   ending on cursor, multiline up, on screen
"   Ac  (|  /  )  /  |   ending on cursor, multiline up, partially off screen

" ranges around cursor:
"   lr   |  / (.) /  |   around cursor, current line
"   lb   |  / (.  /) |   around cursor, multiline down, on screen
"   ar   | (/  .) /  |   around cursor, multiline up, on screen
"   ab   | (/  .  /) |   around cursor, multiline both, on screen
"   lB   |  / (.  /  |)  around cursor, multiline down, partially off screen
"   Ar  (|  /  .) /  |   around cursor, multiline up, partially off screen
"   aB   | (/  .  /  |)  around cursor, multiline both, partially off screen bottom
"   Ab  (|  /  .  /) |   around cursor, multiline both, partially off screen top
"   AB  (|  /  .  /  |)  around cursor, multiline both, partially off screen both

" ranges after (right of/below) cursor
"   rr   |  /  .()/  |   after cursor, current line
"   rb   |  /  .( /) |   after cursor, multiline, on screen
"   rB   |  /  .( /  |)  after cursor, multiline, partially off screen
"   bb   |  /  .  /()|   after cursor below, on screen
"   bB   |  /  .  /( |)  after cursor below, partially off screen
"   BB   |  /  .  /  |() after cursor below, off screen

" ranges before (left of/above) cursor
"   ll   |  /().  /  |   before cursor, current line
"   al   | (/ ).  /  |   before cursor, multiline, on screen
"   Al  (|  / ).  /  |   before cursor, multiline, partially off screen
"   aa   |()/  .  /  |   before cursor above, on screen
"   Aa  (| )/  .  /  |   before cursor above, partially off screen
"   AA ()|  /  .  /  |   before cursor above, off screen

"     A  a  l r  b  B  relative positions
"      └───────────┘   visible screen
"         └─────┘      current line

function! s:bestSeekTarget(targets, oldpos, min, max, message)
    let bestScore = 0
    for target in a:targets
        let range = target.range(a:oldpos, a:min, a:max)
        let score = get(s:rangeScores, range)
        if bestScore < score
            let bestScore = score
            let best = target
        endif
    endfor

    if bestScore > 0
        return best
    endif

    return targets#target#withError(a:message)
endfunction

" selection modifiers
" ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯

" drop delimiters left and right
" remove last line of multiline selection if it consists of whitespace only
" in   │   ┌─────┐
" line │ a .  b  . c
" out  │    └───┘
function! s:drop(target)
    if a:target.state().isInvalid()
        return a:target
    endif

    let [sLinewise, eLinewise] = [0, 0]
    call a:target.cursorS()
    if searchpos('\S', 'nW', line('.'))[0] == 0
        " if only whitespace after cursor
        let sLinewise = 1
    endif
    silent! execute "normal! 1 "
    call a:target.getposS()

    call a:target.cursorE()
    if a:target.sl < a:target.el && searchpos('\S', 'bnW', line('.'))[0] == 0
        " if only whitespace in front of cursor
        let eLinewise = 1
        " move to end of line above
        normal! -$
    else
        " one character back
        silent! execute "normal! \<BS>"
    endif
    call a:target.getposE()
    let a:target.linewise = sLinewise && eLinewise
    return a:target
endfunction

" drop right delimiter
" in   │   ┌─────┐
" line │ a . b c . d
" out  │   └────┘
function! s:dropr(target)
    call a:target.cursorE()
    silent! execute "normal! \<BS>"
    call a:target.getposE()
    return a:target
endfunction

" drop an argument separator (like a comma), prefer the right one, fall back
" to the left (one on first argument)
" in   │ ┌───┐ ┌───┐        ┌───┐        ┌───┐
" line │ ( x ) ( x , a ) (a , x , b) ( a , x )
" out  │  └─┘    └──┘       └──┘        └──┘
function! s:dropa(target)
    let startOpening = a:target.getcharS() !~# g:targets_argSeparator
    let endOpening   = a:target.getcharE() !~# g:targets_argSeparator

    if startOpening
        if endOpening
            " ( x ) select space on both sides
            return s:drop(a:target)
        else
            " ( x , a ) select separator and space after
            call a:target.cursorS()
            call a:target.searchposS('\S', '', a:target.el)
            return s:expand(a:target, '>')
        endif
    else
        if !endOpening
            " (a , x , b) select leading separator, no surrounding space
            return s:dropr(a:target)
        else
            " ( a , x ) select separator and space before
            call a:target.cursorE()
            call a:target.searchposE('\S', 'b', a:target.sl)
            return s:expand(a:target, '<')
        endif
    endif
endfunction

" select inner tag delimiters
" in   │   ┌──────────┐
" line │ a <b>  c  </b> c
" out  │     └─────┘
function! s:innert(target)
    call a:target.cursorS()
    call a:target.searchposS('>', 'W')
    call a:target.cursorE()
    call a:target.searchposE('<', 'bW')
    return a:target
endfunction

" drop delimiters and whitespace left and right
" fall back to drop when only whitespace is inside
" in   │   ┌─────┐   │   ┌──┐
" line │ a . b c . d │ a .  . d
" out  │     └─┘     │    └┘
function! s:shrink(target)
    if a:target.state().isInvalid()
        return a:target
    endif

    call a:target.cursorE()
    call a:target.searchposE('\S', 'b', a:target.sl)
    if a:target.state().isInvalidOrEmpty()
        " fall back to drop when there's only whitespace in between
        return s:drop(a:target)
    else
        call a:target.cursorS()
        call a:target.searchposS('\S', '', a:target.el)
    endif
    return a:target
endfunction

" expand selection by some whitespace
" in   │   ┌───┐   │   ┌───┐  │  ┌───┐  │ ┌───┐
" line │ a . b . c │ a . b .c │ a. c .c │ . a .c
" out  │   └────┘  │  └────┘  │  └───┘  │└────┘
" args (target, direction=<try right, then left>)
function! s:expand(...)
    let target = a:1

    if a:0 == 1 || a:2 ==# '>'
        call target.cursorE()
        let [line, column] = searchpos('\S\|$', '', line('.'))
        if line > 0 && column-1 > target.ec
            " non whitespace or EOL after trailing whitespace found
            " not counting whitespace directly after end
            call target.setE(line, column-1)
            return target
        endif
    endif

    if a:0 == 1 || a:2 ==# '<'
        call target.cursorS()
        let [line, column] = searchpos('\S', 'b', line('.'))
        if line > 0
            " non whitespace before leading whitespace found
            call target.setS(line, column+1)
            return target
        endif
        " only whitespace in front of start
        " include all leading whitespace from beginning of line
        let target.sc = 1
    endif

    return target
endfunction

" return 1 if count should be increased by one to grow selection on repeated
" invocations
function! s:grow()
    if s:mapmode ==# 'o' || !s:shouldGrow
        return 0
    endif

    " move cursor back to last raw end of selection to avoid growing being
    " confused by last modifiers
    call s:prepareNext()

    return 1
endfunction

" if in visual mode, move cursor to start of last raw selection
" also used in s:grow to move to last raw end
function! s:prepareNext()
    if s:newSelection
        return
    endif

    if s:mapmode ==# 'x' && exists('s:lastRawTarget') && s:lastRawTarget.state().isNonempty()
        call s:lastRawTarget.cursorS()
    endif
endfunction

" if in visual mode, move cursor to end of last raw selection
" returns whether or not the cursor was moved
function! s:prepareLast()
    if s:newSelection
        return
    endif

    if s:mapmode ==# 'x' && exists('s:lastRawTarget') && s:lastRawTarget.state().isNonempty()
        call s:lastRawTarget.cursorE()
        return 1
    endif
endfunction

" returns the character under the cursor
function! s:getchar()
    return getline('.')[col('.')-1]
endfunction

" search for pattern using flags and a count, optional stopline
" args (cnt, pattern, flags, stopline=0)
function! s:search(...)
    let [cnt, pattern, flags] = [a:1, a:2, a:3]
    if a:0 == 4
        let stopline = a:4
    elseif a:0 == 3
        let stopline = 0
    endif

    for _ in range(cnt)
        let line = searchpos(pattern, flags, stopline)[0]
        if line == 0 " not enough found
            return s:fail('search')
        endif
    endfor
endfunction

" return 1 and send a message to s:debug
" args (message, parameters=nil)
function! s:fail(...)
    if a:0 == 2
        call s:debug('fail ' . a:1 . ' ' . string(a:2))
    else
        call s:debug('fail ' . a:1)
    endif
    return 1
endfunction

" useful for debugging
function! s:debug(message)
    " echom a:message
endfunction

" reset cpoptions
let &cpoptions = s:save_cpoptions
unlet s:save_cpoptions
