" Name:         Solarized 8
" Description:  Precision colors for machines and people
" Author:       Ethan Schoonover
" Maintainer:   Lifepillar <lifepillar@lifepillar.me>
" Website:      https://github.com/lifepillar/vim-solarized8
" License:      OSI approved MIT license
" Last Updated: Wed Nov 29 19:34:14 2017

if !(has('termguicolors') && &termguicolors) && !has('gui_running')
      \ && (!exists('&t_Co') || &t_Co < (get(g:, 'solarized_use16', 0) ? 16 : 256))
  echoerr '[Solarized 8] There are not enough colors.'
  finish
endif

hi clear
if exists('syntax_on')
  syntax reset
endif

let g:colors_name = 'solarized8'

" 256-color variant
if !get(g:, 'solarized_use16', 0)
  if &background ==# 'dark'
    " Color similarity table (dark background)
    "  yellow: GUI=#b58900/rgb(181,137,  0)  Term=136 #af8700/rgb(175,135,  0)  [delta=1.465279]
    "    blue: GUI=#268bd2/rgb( 38,139,210)  Term= 32 #0087d7/rgb(  0,135,215)  [delta=2.677029]
    " magenta: GUI=#d33682/rgb(211, 54,130)  Term=162 #d70087/rgb(215,  0,135)  [delta=4.342643]
    "    cyan: GUI=#2aa198/rgb( 42,161,152)  Term= 37 #00afaf/rgb(  0,175,175)  [delta=5.365780]
    "   base1: GUI=#93a1a1/rgb(147,161,161)  Term=247 #9e9e9e/rgb(158,158,158)  [delta=6.489730]
    "  violet: GUI=#6c71c4/rgb(108,113,196)  Term= 61 #5f5faf/rgb( 95, 95,175)  [delta=6.795109]
    "     red: GUI=#dc322f/rgb(220, 50, 47)  Term=160 #d70000/rgb(215,  0,  0)  [delta=6.843619]
    "   green: GUI=#859900/rgb(133,153,  0)  Term=106 #87af00/rgb(135,175,  0)  [delta=6.901386]
    "   base0: GUI=#839496/rgb(131,148,150)  Term=246 #949494/rgb(148,148,148)  [delta=7.557606]
    "   base3: GUI=#fdf6e3/rgb(253,246,227)  Term=230 #ffffd7/rgb(255,255,215)  [delta=7.816259]
    "  orange: GUI=#cb4b16/rgb(203, 75, 22)  Term=166 #d75f00/rgb(215, 95,  0)  [delta=8.065025]
    "   base2: GUI=#eee8d5/rgb(238,232,213)  Term=254 #e4e4e4/rgb(228,228,228)  [delta=8.289679]
    "  base00: GUI=#657b83/rgb(101,123,131)  Term= 66 #5f8787/rgb( 95,135,135)  [delta=8.468738]
    "  base01: GUI=#586e75/rgb( 88,110,117)  Term=242 #6c6c6c/rgb(108,108,108)  [delta=9.227744]
    "    back: GUI=#002b36/rgb(  0, 43, 54)  Term=235 #262626/rgb( 38, 38, 38)  [delta=12.727247]
    "  base03: GUI=#002b36/rgb(  0, 43, 54)  Term=235 #262626/rgb( 38, 38, 38)  [delta=12.727247]
    "  base02: GUI=#073642/rgb(  7, 54, 66)  Term=236 #303030/rgb( 48, 48, 48)  [delta=13.434724]
    if !has('gui_running') && get(g:, 'solarized_termtrans', 0)
      hi Normal ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi FoldColumn ctermfg=fg ctermbg=NONE guifg=fg guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi Folded ctermfg=fg ctermbg=NONE guifg=fg guibg=NONE guisp=#002b36 cterm=NONE,bold gui=NONE,bold
      hi LineNr ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi Terminal ctermfg=fg ctermbg=NONE guifg=fg guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi CursorLineNr ctermbg=NONE guifg=NONE
    else
      hi Normal ctermfg=246 ctermbg=235 guifg=#839496 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi FoldColumn ctermfg=246 ctermbg=236 guifg=#839496 guibg=#073642 guisp=NONE cterm=NONE gui=NONE
      hi Folded ctermfg=246 ctermbg=236 guifg=#839496 guibg=#073642 guisp=#002b36 cterm=NONE,bold gui=NONE,bold
      hi LineNr ctermfg=242 ctermbg=236 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE gui=NONE
      hi Terminal ctermfg=fg ctermbg=235 guifg=fg guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi CursorLineNr ctermbg=236 guibg=#073642
    endif
    if get(g:, "solarized_visibility", "") == "high"
      hi CursorLineNr ctermfg=166 guifg=#cb4b16 cterm=bold gui=bold
      hi NonText ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi SpecialKey ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi SpellBad ctermfg=61 ctermbg=230 guifg=#6c71c4 guibg=#fdf6e3 guisp=#dc322f cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
      hi SpellCap ctermfg=61 ctermbg=230 guifg=#6c71c4 guibg=#fdf6e3 guisp=#dc322f cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
      hi SpellLocal ctermfg=136 ctermbg=230 guifg=#b58900 guibg=#fdf6e3 guisp=#dc322f cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
      hi SpellRare ctermfg=37 ctermbg=230 guifg=#2aa198 guibg=#fdf6e3 guisp=#dc322f cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
      hi Title ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    elseif get(g:, "solarized_visibility", "") == "low"
      hi CursorLineNr ctermfg=242 guifg=#586e75 cterm=bold gui=bold
      hi NonText ctermfg=236 ctermbg=NONE guifg=#073642 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi SpecialKey ctermfg=236 ctermbg=NONE guifg=#073642 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi SpellBad ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
      hi SpellCap ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
      hi SpellLocal ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE,underline gui=NONE,undercurl
      hi SpellRare ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#2aa198 cterm=NONE,underline gui=NONE,undercurl
      hi Title ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    else
      hi CursorLineNr ctermfg=246 guifg=#839496 cterm=bold gui=bold
      hi NonText ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi SpecialKey ctermfg=66 ctermbg=236 guifg=#657b83 guibg=#073642 guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi SpellBad ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
      hi SpellCap ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
      hi SpellLocal ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE,underline gui=NONE,undercurl
      hi SpellRare ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#2aa198 cterm=NONE,underline gui=NONE,undercurl
      hi Title ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    endif
    hi ColorColumn ctermfg=NONE ctermbg=236 guifg=NONE guibg=#073642 guisp=NONE cterm=NONE gui=NONE
    hi Conceal ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    if get(g:, 'solarized_old_cursor_style', 0)
      hi Cursor ctermfg=235 ctermbg=246 guifg=#002b36 guibg=#839496 guisp=NONE cterm=NONE gui=NONE
    else
      hi Cursor ctermfg=230 ctermbg=32 guifg=#fdf6e3 guibg=#268bd2 guisp=NONE cterm=NONE gui=NONE
    endif
    hi CursorColumn ctermfg=NONE ctermbg=236 guifg=NONE guibg=#073642 guisp=NONE cterm=NONE gui=NONE
    hi CursorLine ctermfg=NONE ctermbg=236 guifg=NONE guibg=#073642 guisp=#93a1a1 cterm=NONE gui=NONE
    if get(g:, "solarized_diffmode", "") == "high"
      hi DiffAdd ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi DiffChange ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi DiffDelete ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi DiffText ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    elseif get(g:, "solarized_diffmode", "") == "low"
      hi DiffAdd ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=#859900 cterm=NONE gui=NONE
      hi DiffChange ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE gui=NONE
      hi DiffDelete ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi DiffText ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=#268bd2 cterm=NONE gui=NONE
    else
      hi DiffAdd ctermfg=106 ctermbg=236 guifg=#859900 guibg=#073642 guisp=#859900 cterm=NONE gui=NONE
      hi DiffChange ctermfg=136 ctermbg=236 guifg=#b58900 guibg=#073642 guisp=#b58900 cterm=NONE gui=NONE
      hi DiffDelete ctermfg=160 ctermbg=236 guifg=#dc322f guibg=#073642 guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi DiffText ctermfg=32 ctermbg=236 guifg=#268bd2 guibg=#073642 guisp=#268bd2 cterm=NONE gui=NONE
    endif
    hi Directory ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi EndOfBuffer ctermfg=NONE ctermbg=NONE guifg=NONE guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi ErrorMsg ctermfg=160 ctermbg=230 guifg=#dc322f guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi IncSearch ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,standout gui=NONE,standout
    hi MatchParen ctermfg=230 ctermbg=236 guifg=#fdf6e3 guibg=#073642 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi ModeMsg ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi MoreMsg ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi Pmenu ctermfg=246 ctermbg=236 guifg=#839496 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi PmenuSbar ctermfg=254 ctermbg=246 guifg=#eee8d5 guibg=#839496 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi PmenuSel ctermfg=242 ctermbg=254 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi PmenuThumb ctermfg=246 ctermbg=235 guifg=#839496 guibg=#002b36 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi Question ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link QuickFixLine Search
    hi Search ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi SignColumn ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    if get(g:, "solarized_statusline", "") == "low"
      hi StatusLine ctermfg=242 ctermbg=254 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi StatusLineNC ctermfg=242 ctermbg=236 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi TabLine ctermfg=242 ctermbg=236 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi TabLineFill ctermfg=242 ctermbg=236 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi TabLineSel ctermfg=246 ctermbg=230 guifg=#839496 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    else
      hi StatusLine ctermfg=246 ctermbg=236 guifg=#839496 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi StatusLineNC ctermfg=242 ctermbg=236 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi TabLine ctermfg=242 ctermbg=236 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi TabLineFill ctermfg=242 ctermbg=236 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi TabLineSel ctermfg=246 ctermbg=236 guifg=#839496 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    endif
    hi! link StatusLineTerm StatusLine
    hi! link StatusLineTermNC StatusLineNC
    hi VertSplit ctermfg=242 ctermbg=242 guifg=#586e75 guibg=#586e75 guisp=NONE cterm=NONE gui=NONE
    hi Visual ctermfg=242 ctermbg=235 guifg=#586e75 guibg=#002b36 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi VisualNOS ctermfg=NONE ctermbg=236 guifg=NONE guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi WarningMsg ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi WildMenu ctermfg=254 ctermbg=236 guifg=#eee8d5 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi! link Boolean Constant
    hi! link Character Constant
    hi Comment ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi! link Conditional Statement
    hi Constant ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link Define PreProc
    hi! link Debug Special
    hi! link Delimiter Special
    hi Error ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link Exception Statement
    hi! link Float Constant
    hi! link Function Identifier
    hi Identifier ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi Ignore ctermfg=NONE ctermbg=NONE guifg=NONE guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link Include PreProc
    hi! link Keyword Statement
    hi! link Label Statement
    hi! link Macro PreProc
    hi! link Number Constant
    hi! link Operator Statement
    hi! link PreCondit PreProc
    hi PreProc ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link Repeat Statement
    hi Special ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link SpecialChar Special
    hi! link SpecialComment Special
    hi Statement ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link StorageClass Type
    hi! link String Constant
    hi! link Structure Type
    hi! link Tag Special
    hi Todo ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi Type ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link Typedef Type
    hi Underlined ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link lCursor Cursor
    hi CursorIM ctermfg=NONE ctermbg=fg guifg=NONE guibg=fg guisp=NONE cterm=NONE gui=NONE
    hi ToolbarLine ctermfg=NONE ctermbg=236 guifg=NONE guibg=#073642 guisp=NONE cterm=NONE gui=NONE
    hi ToolbarButton ctermfg=247 ctermbg=236 guifg=#93a1a1 guibg=#073642 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi NormalMode ctermfg=246 ctermbg=230 guifg=#839496 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi InsertMode ctermfg=37 ctermbg=230 guifg=#2aa198 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi ReplaceMode ctermfg=166 ctermbg=230 guifg=#cb4b16 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi VisualMode ctermfg=162 ctermbg=230 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi CommandMode ctermfg=162 ctermbg=230 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    if get(g:, 'solarized_extra_hi_groups', 0)
      hi! link vimVar Identifier
      hi! link vimFunc Function
      hi! link vimUserFunc Function
      hi! link helpSpecial Special
      hi! link vimSet Normal
      hi! link vimSetEqual Normal
      hi vimCommentString ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi vimCommand ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi vimCmdSep ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi helpExample ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi helpOption ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi helpNote ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi helpVim ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi helpHyperTextJump ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi helpHyperTextEntry ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi vimIsCommand ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi vimSynMtchOpt ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi vimSynType ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi vimHiLink ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi vimHiGroup ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi vimGroup ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi! link diffAdded Statement
      hi! link diffLine Identifier
      hi gitcommitComment ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
      hi! link gitcommitUntracked gitcommitComment
      hi! link gitcommitDiscarded gitcommitComment
      hi! link gitcommitSelected gitcommitComment
      hi gitcommitUnmerged ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi gitcommitOnBranch ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi gitcommitBranch ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi! link gitcommitNoBranch gitcommitBranch
      hi gitcommitdiscardedtype ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi gitcommitselectedtype ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi gitcommitHeader ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi gitcommitUntrackedFile ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi gitcommitDiscardedFile ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi gitcommitSelectedFile ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi gitcommitUnmergedFile ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi gitcommitFile ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi! link gitcommitDiscardedArrow gitcommitDiscardedFile
      hi! link gitcommitSelectedArrow gitcommitSelectedFile
      hi! link gitcommitUnmergedArrow gitcommitUnmergedFile
      hi htmlTag ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi htmlEndTag ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi htmlTagN ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi htmlTagName ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi htmlSpecialTagName ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
      hi htmlArg ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi javaScript ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi perlHereDoc ctermfg=247 ctermbg=235 guifg=#93a1a1 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi perlVarPlain ctermfg=136 ctermbg=235 guifg=#b58900 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi perlStatementFileDesc ctermfg=37 ctermbg=235 guifg=#2aa198 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi texstatement ctermfg=37 ctermbg=235 guifg=#2aa198 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi texmathzonex ctermfg=136 ctermbg=235 guifg=#b58900 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi texmathmatcher ctermfg=136 ctermbg=235 guifg=#b58900 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi texreflabel ctermfg=136 ctermbg=235 guifg=#b58900 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi rubyDefine ctermfg=247 ctermbg=235 guifg=#93a1a1 guibg=#002b36 guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi! link rubySymbol Type
      hi rubyBoolean ctermfg=162 ctermbg=235 guifg=#d33682 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      let hs_highlight_boolean=1
      let hs_highlight_delimiters=1
      hi cPreCondit ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi VarId ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi ConId ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsImport ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsString ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsStructure ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hs_hlFunctionName ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsStatement ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsImportLabel ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hs_OpFunctionName ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hs_DeclareFunction ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsVarSym ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsType ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsTypedef ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsModuleName ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi! link hsImportParams Delimiter
      hi! link hsDelimTypeExport Delimiter
      hi! link hsModuleStartLabel hsStructure
      hi! link hsModuleWhereLabel hsModuleStartLabel
      hi hsNiceOperator ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi hsniceoperator ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocTitleBlock ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocTitleBlockTitle ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocTitleComment ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocComment ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
      hi pandocVerbatimBlock ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi! link pandocVerbatimBlockDeep pandocVerbatimBlock
      hi! link pandocCodeBlock pandocVerbatimBlock
      hi! link pandocCodeBlockDelim pandocVerbatimBlock
      hi pandocBlockQuote ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocBlockQuoteLeader1 ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocBlockQuoteLeader2 ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocBlockQuoteLeader3 ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocBlockQuoteLeader4 ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocBlockQuoteLeader5 ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocBlockQuoteLeader6 ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocListMarker ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocListReference ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocDefinitionBlock ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocDefinitionTerm ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,standout gui=NONE,standout
      hi pandocDefinitionIndctr ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocEmphasisDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
      hi pandocEmphasisNestedDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisNestedDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisEmphasisDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrikeoutDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi pandocVerbatimInlineDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocSuperscriptDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocSubscriptDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocTableStructure ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi! link pandocTableStructureTop pandocTableStructre
      hi! link pandocTableStructureEnd pandocTableStructre
      hi pandocTableZebraLight ctermfg=32 ctermbg=235 guifg=#268bd2 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
      hi pandocTableZebraDark ctermfg=32 ctermbg=236 guifg=#268bd2 guibg=#073642 guisp=NONE cterm=NONE gui=NONE
      hi pandocEmphasisTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
      hi pandocEmphasisNestedTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisNestedTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisEmphasisTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrikeoutTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi pandocVerbatimInlineTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocSuperscriptTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocSubscriptTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocHeadingMarker ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocEmphasisHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocEmphasisNestedHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisNestedHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisEmphasisHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrikeoutHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi pandocVerbatimInlineHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocSuperscriptHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocSubscriptHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocLinkDelim ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocLinkLabel ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocLinkText ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocLinkURL ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocLinkTitle ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocLinkTitleDelim ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=#657b83 cterm=NONE gui=NONE
      hi pandocLinkDefinition ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#657b83 cterm=NONE gui=NONE
      hi pandocLinkDefinitionID ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocImageCaption ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocFootnoteLink ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocFootnoteDefLink ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocFootnoteInline ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocFootnote ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocCitationDelim ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocCitation ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocCitationID ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocCitationRef ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocStyleDelim ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocEmphasis ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
      hi pandocEmphasisNested ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasis ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisNested ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrongEmphasisEmphasis ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocStrikeout ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi pandocVerbatimInline ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocSuperscript ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocSubscript ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocRule ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocRuleLine ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocEscapePair ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi pandocCitationRef ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocNonBreakingSpace ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
      hi! link pandocEscapedCharacter pandocEscapePair
      hi! link pandocLineBreak pandocEscapePair
      hi pandocMetadataDelim ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocMetadata ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocMetadataKey ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
      hi pandocMetadata ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
      hi! link pandocMetadataTitle pandocMetadata
    endif
    if get(g:, "solarized_term_italics", 0)
      hi Comment cterm=italic
      hi gitcommitComment cterm=italic
      hi htmlSpecialTagName cterm=italic
      hi pandocComment cterm=italic
      hi pandocEmphasisDefinition cterm=italic
      hi pandocEmphasisTable cterm=italic
      hi pandocEmphasis cterm=italic
    endif
    if has('nvim')
      hi! link TermCursor Cursor
      hi TermCursorNC ctermfg=235 ctermbg=242 guifg=#002b36 guibg=#586e75 guisp=NONE cterm=NONE gui=NONE
      let g:terminal_color_8='#002b36'
      let g:terminal_color_0='#073642'
      let g:terminal_color_10='#586e75'
      let g:terminal_color_11='#657b83'
      let g:terminal_color_12='#839496'
      let g:terminal_color_14='#93a1a1'
      let g:terminal_color_7='#eee8d5'
      let g:terminal_color_15='#fdf6e3'
      let g:terminal_color_3='#b58900'
      let g:terminal_color_9='#cb4b16'
      let g:terminal_color_1='#dc322f'
      let g:terminal_color_5='#d33682'
      let g:terminal_color_13='#6c71c4'
      let g:terminal_color_4='#268bd2'
      let g:terminal_color_6='#2aa198'
      let g:terminal_color_2='#859900'
    endif
    finish
  endif

  " Color similarity table (light background)
  "  yellow: GUI=#b58900/rgb(181,137,  0)  Term=136 #af8700/rgb(175,135,  0)  [delta=1.465279]
  "    blue: GUI=#268bd2/rgb( 38,139,210)  Term= 32 #0087d7/rgb(  0,135,215)  [delta=2.677029]
  " magenta: GUI=#d33682/rgb(211, 54,130)  Term=162 #d70087/rgb(215,  0,135)  [delta=4.342643]
  "    cyan: GUI=#2aa198/rgb( 42,161,152)  Term= 37 #00afaf/rgb(  0,175,175)  [delta=5.365780]
  "  base01: GUI=#93a1a1/rgb(147,161,161)  Term=247 #9e9e9e/rgb(158,158,158)  [delta=6.489730]
  "  violet: GUI=#6c71c4/rgb(108,113,196)  Term= 61 #5f5faf/rgb( 95, 95,175)  [delta=6.795109]
  "     red: GUI=#dc322f/rgb(220, 50, 47)  Term=160 #d70000/rgb(215,  0,  0)  [delta=6.843619]
  "   green: GUI=#859900/rgb(133,153,  0)  Term=106 #87af00/rgb(135,175,  0)  [delta=6.901386]
  "  base00: GUI=#839496/rgb(131,148,150)  Term=246 #949494/rgb(148,148,148)  [delta=7.557606]
  "    back: GUI=#fdf6e3/rgb(253,246,227)  Term=230 #ffffd7/rgb(255,255,215)  [delta=7.816259]
  "  base03: GUI=#fdf6e3/rgb(253,246,227)  Term=230 #ffffd7/rgb(255,255,215)  [delta=7.816259]
  "  orange: GUI=#cb4b16/rgb(203, 75, 22)  Term=166 #d75f00/rgb(215, 95,  0)  [delta=8.065025]
  "  base02: GUI=#eee8d5/rgb(238,232,213)  Term=254 #e4e4e4/rgb(228,228,228)  [delta=8.289679]
  "   base0: GUI=#657b83/rgb(101,123,131)  Term= 66 #5f8787/rgb( 95,135,135)  [delta=8.468738]
  "   base1: GUI=#586e75/rgb( 88,110,117)  Term=242 #6c6c6c/rgb(108,108,108)  [delta=9.227744]
  "   base3: GUI=#002b36/rgb(  0, 43, 54)  Term=235 #262626/rgb( 38, 38, 38)  [delta=12.727247]
  "   base2: GUI=#073642/rgb(  7, 54, 66)  Term=236 #303030/rgb( 48, 48, 48)  [delta=13.434724]
  if !has('gui_running') && get(g:, 'solarized_termtrans', 0)
    hi Normal ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi FoldColumn ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi Folded ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=#fdf6e3 cterm=NONE,bold gui=NONE,bold
    hi LineNr ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi Terminal ctermfg=fg ctermbg=NONE guifg=fg guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi CursorLineNr ctermbg=NONE guifg=NONE
  else
    hi Normal ctermfg=66 ctermbg=230 guifg=#657b83 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi FoldColumn ctermfg=66 ctermbg=254 guifg=#657b83 guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
    hi Folded ctermfg=66 ctermbg=254 guifg=#657b83 guibg=#eee8d5 guisp=#fdf6e3 cterm=NONE,bold gui=NONE,bold
    hi LineNr ctermfg=247 ctermbg=254 guifg=#93a1a1 guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
    hi Terminal ctermfg=fg ctermbg=230 guifg=fg guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi CursorLineNr ctermbg=254 guibg=#eee8d5
  endif
  if get(g:, "solarized_visibility", "") == "high"
    hi CursorLineNr ctermfg=160 guifg=#dc322f cterm=bold gui=bold
    if get(g:, 'solarized_old_cursor_style', 0)
      hi Cursor ctermfg=230 ctermbg=66 guifg=#fdf6e3 guibg=#657b83 guisp=NONE cterm=NONE gui=NONE
    else
      hi Cursor ctermfg=230 ctermbg=160 guifg=#fdf6e3 guibg=#dc322f guisp=NONE cterm=NONE gui=NONE
    endif
    hi MatchParen ctermfg=230 ctermbg=246 guifg=#fdf6e3 guibg=#839496 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi NonText ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpecialKey ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi SpellBad ctermfg=162 ctermbg=230 guifg=#d33682 guibg=#fdf6e3 guisp=#6c71c4 cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
    hi SpellCap ctermfg=162 ctermbg=230 guifg=#d33682 guibg=#fdf6e3 guisp=#6c71c4 cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
    hi SpellLocal ctermfg=136 ctermbg=230 guifg=#b58900 guibg=#fdf6e3 guisp=#cb4b16 cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
    hi SpellRare ctermfg=37 ctermbg=230 guifg=#2aa198 guibg=#fdf6e3 guisp=#cb4b16 cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
    hi Title ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  elseif get(g:, "solarized_visibility", "") == "low"
    hi CursorLineNr ctermfg=247 guifg=#93a1a1 cterm=bold gui=bold
    if get(g:, 'solarized_old_cursor_style', 0)
      hi Cursor ctermfg=230 ctermbg=66 guifg=#fdf6e3 guibg=#657b83 guisp=NONE cterm=NONE gui=NONE
    else
      hi Cursor ctermfg=230 ctermbg=166 guifg=#fdf6e3 guibg=#cb4b16 guisp=NONE cterm=NONE gui=NONE
    endif
    hi MatchParen ctermfg=160 ctermbg=254 guifg=#dc322f guibg=#eee8d5 guisp=NONE cterm=NONE,bold,underline gui=NONE,bold,underline
    hi NonText ctermfg=254 ctermbg=NONE guifg=#eee8d5 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpecialKey ctermfg=254 ctermbg=NONE guifg=#eee8d5 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpellBad ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
    hi SpellCap ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
    hi SpellLocal ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE,underline gui=NONE,undercurl
    hi SpellRare ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#2aa198 cterm=NONE,underline gui=NONE,undercurl
    hi Title ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  else
    hi CursorLineNr ctermfg=66 guifg=#657b83 cterm=bold gui=bold
    if get(g:, 'solarized_old_cursor_style', 0)
      hi Cursor ctermfg=230 ctermbg=66 guifg=#fdf6e3 guibg=#657b83 guisp=NONE cterm=NONE gui=NONE
    else
      hi Cursor ctermfg=230 ctermbg=166 guifg=#fdf6e3 guibg=#cb4b16 guisp=NONE cterm=NONE gui=NONE
    endif
    hi MatchParen ctermfg=160 ctermbg=254 guifg=#dc322f guibg=#eee8d5 guisp=NONE cterm=NONE,bold,underline gui=NONE,bold,underline
    hi NonText ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpecialKey ctermfg=246 ctermbg=254 guifg=#839496 guibg=#eee8d5 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpellBad ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
    hi SpellCap ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
    hi SpellLocal ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE,underline gui=NONE,undercurl
    hi SpellRare ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#2aa198 cterm=NONE,underline gui=NONE,undercurl
    hi Title ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  endif
  hi ColorColumn ctermfg=NONE ctermbg=254 guifg=NONE guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
  hi Conceal ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi CursorColumn ctermfg=NONE ctermbg=254 guifg=NONE guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
  hi CursorLine ctermfg=NONE ctermbg=254 guifg=NONE guibg=#eee8d5 guisp=#586e75 cterm=NONE gui=NONE
  if get(g:, "solarized_diffmode", "") == "high"
    hi DiffAdd ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi DiffChange ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi DiffDelete ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi DiffText ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  elseif get(g:, "solarized_diffmode", "") == "low"
    hi DiffAdd ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=#859900 cterm=NONE gui=NONE
    hi DiffChange ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE gui=NONE
    hi DiffDelete ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi DiffText ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=#268bd2 cterm=NONE gui=NONE
  else
    hi DiffAdd ctermfg=106 ctermbg=254 guifg=#859900 guibg=#eee8d5 guisp=#859900 cterm=NONE gui=NONE
    hi DiffChange ctermfg=136 ctermbg=254 guifg=#b58900 guibg=#eee8d5 guisp=#b58900 cterm=NONE gui=NONE
    hi DiffDelete ctermfg=160 ctermbg=254 guifg=#dc322f guibg=#eee8d5 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi DiffText ctermfg=32 ctermbg=254 guifg=#268bd2 guibg=#eee8d5 guisp=#268bd2 cterm=NONE gui=NONE
  endif
  hi Directory ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi EndOfBuffer ctermfg=NONE ctermbg=NONE guifg=NONE guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi ErrorMsg ctermfg=160 ctermbg=230 guifg=#dc322f guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi IncSearch ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,standout gui=NONE,standout
  hi ModeMsg ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi MoreMsg ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi Pmenu ctermfg=66 ctermbg=254 guifg=#657b83 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi PmenuSbar ctermfg=236 ctermbg=66 guifg=#073642 guibg=#657b83 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi PmenuSel ctermfg=247 ctermbg=236 guifg=#93a1a1 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi PmenuThumb ctermfg=66 ctermbg=230 guifg=#657b83 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi Question ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link QuickFixLine Search
  hi Search ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi SignColumn ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  if get(g:, "solarized_statusline", "") == "low"
    hi StatusLine ctermfg=247 ctermbg=230 guifg=#93a1a1 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi StatusLineNC ctermfg=247 ctermbg=242 guifg=#93a1a1 guibg=#586e75 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLine ctermfg=247 ctermbg=242 guifg=#93a1a1 guibg=#586e75 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLineFill ctermfg=247 ctermbg=242 guifg=#93a1a1 guibg=#586e75 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLineSel ctermfg=242 ctermbg=230 guifg=#586e75 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  else
    hi StatusLine ctermfg=242 ctermbg=254 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi StatusLineNC ctermfg=246 ctermbg=254 guifg=#839496 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLine ctermfg=246 ctermbg=254 guifg=#839496 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLineFill ctermfg=246 ctermbg=254 guifg=#839496 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLineSel ctermfg=242 ctermbg=254 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  endif
  hi! link StatusLineTerm StatusLine
  hi! link StatusLineTermNC StatusLineNC
  hi VertSplit ctermfg=247 ctermbg=247 guifg=#93a1a1 guibg=#93a1a1 guisp=NONE cterm=NONE gui=NONE
  hi Visual ctermfg=247 ctermbg=230 guifg=#93a1a1 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi VisualNOS ctermfg=NONE ctermbg=254 guifg=NONE guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi WarningMsg ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi WildMenu ctermfg=236 ctermbg=254 guifg=#073642 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi! link Boolean Constant
  hi! link Character Constant
  hi Comment ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
  hi! link Conditional Statement
  hi Constant ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link Define PreProc
  hi! link Debug Special
  hi! link Delimiter Special
  hi Error ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link Exception Statement
  hi! link Float Constant
  hi! link Function Identifier
  hi Identifier ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi Ignore ctermfg=NONE ctermbg=NONE guifg=NONE guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link Include PreProc
  hi! link Keyword Statement
  hi! link Label Statement
  hi! link Macro PreProc
  hi! link Number Constant
  hi! link Operator Statement
  hi! link PreCondit PreProc
  hi PreProc ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link Repeat Statement
  hi Special ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link SpecialChar Special
  hi! link SpecialComment Special
  hi Statement ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link StorageClass Type
  hi! link String Constant
  hi! link Structure Type
  hi! link Tag Special
  hi Todo ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi Type ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link Typedef Type
  hi Underlined ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link lCursor Cursor
  hi CursorIM ctermfg=NONE ctermbg=fg guifg=NONE guibg=fg guisp=NONE cterm=NONE gui=NONE
  hi ToolbarLine ctermfg=NONE ctermbg=254 guifg=NONE guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
  hi ToolbarButton ctermfg=242 ctermbg=254 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi NormalMode ctermfg=242 ctermbg=230 guifg=#586e75 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi InsertMode ctermfg=37 ctermbg=230 guifg=#2aa198 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi ReplaceMode ctermfg=166 ctermbg=230 guifg=#cb4b16 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi VisualMode ctermfg=162 ctermbg=230 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi CommandMode ctermfg=162 ctermbg=230 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  if get(g:, 'solarized_extra_hi_groups', 0)
    hi! link vimVar Identifier
    hi! link vimFunc Function
    hi! link vimUserFunc Function
    hi! link helpSpecial Special
    hi! link vimSet Normal
    hi! link vimSetEqual Normal
    hi vimCommentString ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimCommand ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimCmdSep ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi helpExample ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpOption ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpNote ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpVim ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpHyperTextJump ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpHyperTextEntry ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimIsCommand ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimSynMtchOpt ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimSynType ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimHiLink ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimHiGroup ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimGroup ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link diffAdded Statement
    hi! link diffLine Identifier
    hi gitcommitComment ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi! link gitcommitUntracked gitcommitComment
    hi! link gitcommitDiscarded gitcommitComment
    hi! link gitcommitSelected gitcommitComment
    hi gitcommitUnmerged ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitOnBranch ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitBranch ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link gitcommitNoBranch gitcommitBranch
    hi gitcommitdiscardedtype ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi gitcommitselectedtype ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi gitcommitHeader ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi gitcommitUntrackedFile ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitDiscardedFile ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitSelectedFile ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitUnmergedFile ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitFile ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link gitcommitDiscardedArrow gitcommitDiscardedFile
    hi! link gitcommitSelectedArrow gitcommitSelectedFile
    hi! link gitcommitUnmergedArrow gitcommitUnmergedFile
    hi htmlTag ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi htmlEndTag ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi htmlTagN ctermfg=242 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi htmlTagName ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi htmlSpecialTagName ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi htmlArg ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi javaScript ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi perlHereDoc ctermfg=242 ctermbg=230 guifg=#586e75 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi perlVarPlain ctermfg=136 ctermbg=230 guifg=#b58900 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi perlStatementFileDesc ctermfg=37 ctermbg=230 guifg=#2aa198 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi texstatement ctermfg=37 ctermbg=230 guifg=#2aa198 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi texmathzonex ctermfg=136 ctermbg=230 guifg=#b58900 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi texmathmatcher ctermfg=136 ctermbg=230 guifg=#b58900 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi texreflabel ctermfg=136 ctermbg=230 guifg=#b58900 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi rubyDefine ctermfg=242 ctermbg=230 guifg=#586e75 guibg=#fdf6e3 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link rubySymbol Type
    hi rubyBoolean ctermfg=162 ctermbg=230 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    let hs_highlight_boolean=1
    let hs_highlight_delimiters=1
    hi cPreCondit ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi VarId ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi ConId ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsImport ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsString ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsStructure ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hs_hlFunctionName ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsStatement ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsImportLabel ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hs_OpFunctionName ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hs_DeclareFunction ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsVarSym ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsType ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsTypedef ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsModuleName ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link hsImportParams Delimiter
    hi! link hsDelimTypeExport Delimiter
    hi! link hsModuleStartLabel hsStructure
    hi! link hsModuleWhereLabel hsModuleStartLabel
    hi hsNiceOperator ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsniceoperator ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocTitleBlock ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocTitleBlockTitle ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocTitleComment ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocComment ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi pandocVerbatimBlock ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link pandocVerbatimBlockDeep pandocVerbatimBlock
    hi! link pandocCodeBlock pandocVerbatimBlock
    hi! link pandocCodeBlockDelim pandocVerbatimBlock
    hi pandocBlockQuote ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader1 ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader2 ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader3 ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader4 ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader5 ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader6 ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocListMarker ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocListReference ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocDefinitionBlock ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocDefinitionTerm ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,standout gui=NONE,standout
    hi pandocDefinitionIndctr ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocEmphasisDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi pandocEmphasisNestedDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisNestedDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisEmphasisDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrikeoutDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi pandocVerbatimInlineDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSuperscriptDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSubscriptDefinition ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocTableStructure ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link pandocTableStructureTop pandocTableStructre
    hi! link pandocTableStructureEnd pandocTableStructre
    hi pandocTableZebraLight ctermfg=32 ctermbg=230 guifg=#268bd2 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
    hi pandocTableZebraDark ctermfg=32 ctermbg=254 guifg=#268bd2 guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
    hi pandocEmphasisTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi pandocEmphasisNestedTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisNestedTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisEmphasisTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrikeoutTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi pandocVerbatimInlineTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSuperscriptTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSubscriptTable ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocHeadingMarker ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocEmphasisHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocEmphasisNestedHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisNestedHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisEmphasisHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrikeoutHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi pandocVerbatimInlineHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocSuperscriptHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocSubscriptHeading ctermfg=166 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocLinkDelim ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkLabel ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkText ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkURL ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkTitle ctermfg=246 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkTitleDelim ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=#839496 cterm=NONE gui=NONE
    hi pandocLinkDefinition ctermfg=37 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#839496 cterm=NONE gui=NONE
    hi pandocLinkDefinitionID ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocImageCaption ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocFootnoteLink ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocFootnoteDefLink ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocFootnoteInline ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocFootnote ctermfg=106 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocCitationDelim ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocCitation ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocCitationID ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocCitationRef ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocStyleDelim ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocEmphasis ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi pandocEmphasisNested ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasis ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisNested ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisEmphasis ctermfg=66 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrikeout ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi pandocVerbatimInline ctermfg=136 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSuperscript ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSubscript ctermfg=61 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocRule ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocRuleLine ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocEscapePair ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocCitationRef ctermfg=162 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocNonBreakingSpace ctermfg=160 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi! link pandocEscapedCharacter pandocEscapePair
    hi! link pandocLineBreak pandocEscapePair
    hi pandocMetadataDelim ctermfg=247 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocMetadata ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocMetadataKey ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocMetadata ctermfg=32 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link pandocMetadataTitle pandocMetadata
  endif
  if get(g:, "solarized_term_italics", 0)
    hi Comment cterm=italic
    hi gitcommitComment cterm=italic
    hi htmlSpecialTagName cterm=italic
    hi pandocComment cterm=italic
    hi pandocEmphasisDefinition cterm=italic
    hi pandocEmphasisTable cterm=italic
    hi pandocEmphasis cterm=italic
  endif
  if has('nvim')
    hi! link TermCursor Cursor
    hi TermCursorNC ctermfg=230 ctermbg=247 guifg=#fdf6e3 guibg=#93a1a1 guisp=NONE cterm=NONE gui=NONE
    let g:terminal_color_8='#fdf6e3'
    let g:terminal_color_0='#eee8d5'
    let g:terminal_color_10='#93a1a1'
    let g:terminal_color_11='#839496'
    let g:terminal_color_12='#657b83'
    let g:terminal_color_14='#586e75'
    let g:terminal_color_7='#073642'
    let g:terminal_color_15='#002b36'
    let g:terminal_color_3='#b58900'
    let g:terminal_color_9='#cb4b16'
    let g:terminal_color_1='#dc322f'
    let g:terminal_color_5='#d33682'
    let g:terminal_color_13='#6c71c4'
    let g:terminal_color_4='#268bd2'
    let g:terminal_color_6='#2aa198'
    let g:terminal_color_2='#859900'
  endif
  finish
endif

" 16-color variant
if &background ==# 'dark'
  if !has('gui_running') && get(g:, 'solarized_termtrans', 0)
    hi Normal ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi FoldColumn ctermfg=fg ctermbg=NONE guifg=fg guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi Folded ctermfg=fg ctermbg=NONE guifg=fg guibg=NONE guisp=#002b36 cterm=NONE,bold gui=NONE,bold
    hi LineNr ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi Terminal ctermfg=fg ctermbg=NONE guifg=fg guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi CursorLineNr ctermbg=NONE guifg=NONE
  else
    hi Normal ctermfg=12 ctermbg=8 guifg=#839496 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi FoldColumn ctermfg=12 ctermbg=0 guifg=#839496 guibg=#073642 guisp=NONE cterm=NONE gui=NONE
    hi Folded ctermfg=12 ctermbg=0 guifg=#839496 guibg=#073642 guisp=#002b36 cterm=NONE,bold gui=NONE,bold
    hi LineNr ctermfg=10 ctermbg=0 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE gui=NONE
    hi Terminal ctermfg=fg ctermbg=8 guifg=fg guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi CursorLineNr ctermbg=0 guibg=#073642
  endif
  if get(g:, "solarized_visibility", "") == "high"
    hi CursorLineNr ctermfg=9 guifg=#cb4b16 cterm=bold gui=bold
    hi NonText ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpecialKey ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi SpellBad ctermfg=13 ctermbg=15 guifg=#6c71c4 guibg=#fdf6e3 guisp=#dc322f cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
    hi SpellCap ctermfg=13 ctermbg=15 guifg=#6c71c4 guibg=#fdf6e3 guisp=#dc322f cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
    hi SpellLocal ctermfg=3 ctermbg=15 guifg=#b58900 guibg=#fdf6e3 guisp=#dc322f cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
    hi SpellRare ctermfg=6 ctermbg=15 guifg=#2aa198 guibg=#fdf6e3 guisp=#dc322f cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
    hi Title ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  elseif get(g:, "solarized_visibility", "") == "low"
    hi CursorLineNr ctermfg=10 guifg=#586e75 cterm=bold gui=bold
    hi NonText ctermfg=0 ctermbg=NONE guifg=#073642 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpecialKey ctermfg=0 ctermbg=NONE guifg=#073642 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi SpellBad ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
    hi SpellCap ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
    hi SpellLocal ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE,underline gui=NONE,undercurl
    hi SpellRare ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#2aa198 cterm=NONE,underline gui=NONE,undercurl
    hi Title ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  else
    hi CursorLineNr ctermfg=12 guifg=#839496 cterm=bold gui=bold
    hi NonText ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpecialKey ctermfg=11 ctermbg=0 guifg=#657b83 guibg=#073642 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi SpellBad ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
    hi SpellCap ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
    hi SpellLocal ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE,underline gui=NONE,undercurl
    hi SpellRare ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#2aa198 cterm=NONE,underline gui=NONE,undercurl
    hi Title ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  endif
  hi ColorColumn ctermfg=NONE ctermbg=0 guifg=NONE guibg=#073642 guisp=NONE cterm=NONE gui=NONE
  hi Conceal ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  if get(g:, 'solarized_old_cursor_style', 0)
    hi Cursor ctermfg=8 ctermbg=12 guifg=#002b36 guibg=#839496 guisp=NONE cterm=NONE gui=NONE
  else
    hi Cursor ctermfg=15 ctermbg=4 guifg=#fdf6e3 guibg=#268bd2 guisp=NONE cterm=NONE gui=NONE
  endif
  hi CursorColumn ctermfg=NONE ctermbg=0 guifg=NONE guibg=#073642 guisp=NONE cterm=NONE gui=NONE
  hi CursorLine ctermfg=NONE ctermbg=0 guifg=NONE guibg=#073642 guisp=#93a1a1 cterm=NONE gui=NONE
  if get(g:, "solarized_diffmode", "") == "high"
    hi DiffAdd ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi DiffChange ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi DiffDelete ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi DiffText ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  elseif get(g:, "solarized_diffmode", "") == "low"
    hi DiffAdd ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=#859900 cterm=NONE gui=NONE
    hi DiffChange ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE gui=NONE
    hi DiffDelete ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi DiffText ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=#268bd2 cterm=NONE gui=NONE
  else
    hi DiffAdd ctermfg=2 ctermbg=0 guifg=#859900 guibg=#073642 guisp=#859900 cterm=NONE gui=NONE
    hi DiffChange ctermfg=3 ctermbg=0 guifg=#b58900 guibg=#073642 guisp=#b58900 cterm=NONE gui=NONE
    hi DiffDelete ctermfg=1 ctermbg=0 guifg=#dc322f guibg=#073642 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi DiffText ctermfg=4 ctermbg=0 guifg=#268bd2 guibg=#073642 guisp=#268bd2 cterm=NONE gui=NONE
  endif
  hi Directory ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi EndOfBuffer ctermfg=NONE ctermbg=NONE guifg=NONE guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi ErrorMsg ctermfg=1 ctermbg=15 guifg=#dc322f guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi IncSearch ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,standout gui=NONE,standout
  hi MatchParen ctermfg=15 ctermbg=0 guifg=#fdf6e3 guibg=#073642 guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi ModeMsg ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi MoreMsg ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi Pmenu ctermfg=12 ctermbg=0 guifg=#839496 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi PmenuSbar ctermfg=7 ctermbg=12 guifg=#eee8d5 guibg=#839496 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi PmenuSel ctermfg=10 ctermbg=7 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi PmenuThumb ctermfg=12 ctermbg=8 guifg=#839496 guibg=#002b36 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi Question ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link QuickFixLine Search
  hi Search ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi SignColumn ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  if get(g:, "solarized_statusline", "") == "low"
    hi StatusLine ctermfg=10 ctermbg=7 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi StatusLineNC ctermfg=10 ctermbg=0 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLine ctermfg=10 ctermbg=0 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLineFill ctermfg=10 ctermbg=0 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLineSel ctermfg=12 ctermbg=15 guifg=#839496 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  else
    hi StatusLine ctermfg=12 ctermbg=0 guifg=#839496 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi StatusLineNC ctermfg=10 ctermbg=0 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLine ctermfg=10 ctermbg=0 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLineFill ctermfg=10 ctermbg=0 guifg=#586e75 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi TabLineSel ctermfg=12 ctermbg=0 guifg=#839496 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  endif
  hi! link StatusLineTerm StatusLine
  hi! link StatusLineTermNC StatusLineNC
  hi VertSplit ctermfg=10 ctermbg=10 guifg=#586e75 guibg=#586e75 guisp=NONE cterm=NONE gui=NONE
  hi Visual ctermfg=10 ctermbg=8 guifg=#586e75 guibg=#002b36 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi VisualNOS ctermfg=NONE ctermbg=0 guifg=NONE guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi WarningMsg ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi WildMenu ctermfg=7 ctermbg=0 guifg=#eee8d5 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi! link Boolean Constant
  hi! link Character Constant
  hi Comment ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
  hi! link Conditional Statement
  hi Constant ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link Define PreProc
  hi! link Debug Special
  hi! link Delimiter Special
  hi Error ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link Exception Statement
  hi! link Float Constant
  hi! link Function Identifier
  hi Identifier ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi Ignore ctermfg=NONE ctermbg=NONE guifg=NONE guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link Include PreProc
  hi! link Keyword Statement
  hi! link Label Statement
  hi! link Macro PreProc
  hi! link Number Constant
  hi! link Operator Statement
  hi! link PreCondit PreProc
  hi PreProc ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link Repeat Statement
  hi Special ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link SpecialChar Special
  hi! link SpecialComment Special
  hi Statement ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link StorageClass Type
  hi! link String Constant
  hi! link Structure Type
  hi! link Tag Special
  hi Todo ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi Type ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link Typedef Type
  hi Underlined ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link lCursor Cursor
  hi CursorIM ctermfg=NONE ctermbg=fg guifg=NONE guibg=fg guisp=NONE cterm=NONE gui=NONE
  hi ToolbarLine ctermfg=NONE ctermbg=0 guifg=NONE guibg=#073642 guisp=NONE cterm=NONE gui=NONE
  hi ToolbarButton ctermfg=14 ctermbg=0 guifg=#93a1a1 guibg=#073642 guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi NormalMode ctermfg=12 ctermbg=15 guifg=#839496 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi InsertMode ctermfg=6 ctermbg=15 guifg=#2aa198 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi ReplaceMode ctermfg=9 ctermbg=15 guifg=#cb4b16 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi VisualMode ctermfg=5 ctermbg=15 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi CommandMode ctermfg=5 ctermbg=15 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  if get(g:, 'solarized_extra_hi_groups', 0)
    hi! link vimVar Identifier
    hi! link vimFunc Function
    hi! link vimUserFunc Function
    hi! link helpSpecial Special
    hi! link vimSet Normal
    hi! link vimSetEqual Normal
    hi vimCommentString ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimCommand ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimCmdSep ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi helpExample ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpOption ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpNote ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpVim ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpHyperTextJump ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi helpHyperTextEntry ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimIsCommand ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimSynMtchOpt ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimSynType ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimHiLink ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimHiGroup ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi vimGroup ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link diffAdded Statement
    hi! link diffLine Identifier
    hi gitcommitComment ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi! link gitcommitUntracked gitcommitComment
    hi! link gitcommitDiscarded gitcommitComment
    hi! link gitcommitSelected gitcommitComment
    hi gitcommitUnmerged ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitOnBranch ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitBranch ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link gitcommitNoBranch gitcommitBranch
    hi gitcommitdiscardedtype ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi gitcommitselectedtype ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi gitcommitHeader ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi gitcommitUntrackedFile ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitDiscardedFile ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitSelectedFile ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitUnmergedFile ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi gitcommitFile ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link gitcommitDiscardedArrow gitcommitDiscardedFile
    hi! link gitcommitSelectedArrow gitcommitSelectedFile
    hi! link gitcommitUnmergedArrow gitcommitUnmergedFile
    hi htmlTag ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi htmlEndTag ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi htmlTagN ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi htmlTagName ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi htmlSpecialTagName ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi htmlArg ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi javaScript ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi perlHereDoc ctermfg=14 ctermbg=8 guifg=#93a1a1 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi perlVarPlain ctermfg=3 ctermbg=8 guifg=#b58900 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi perlStatementFileDesc ctermfg=6 ctermbg=8 guifg=#2aa198 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi texstatement ctermfg=6 ctermbg=8 guifg=#2aa198 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi texmathzonex ctermfg=3 ctermbg=8 guifg=#b58900 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi texmathmatcher ctermfg=3 ctermbg=8 guifg=#b58900 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi texreflabel ctermfg=3 ctermbg=8 guifg=#b58900 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi rubyDefine ctermfg=14 ctermbg=8 guifg=#93a1a1 guibg=#002b36 guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link rubySymbol Type
    hi rubyBoolean ctermfg=5 ctermbg=8 guifg=#d33682 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    let hs_highlight_boolean=1
    let hs_highlight_delimiters=1
    hi cPreCondit ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi VarId ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi ConId ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsImport ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsString ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsStructure ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hs_hlFunctionName ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsStatement ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsImportLabel ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hs_OpFunctionName ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hs_DeclareFunction ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsVarSym ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsType ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsTypedef ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsModuleName ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link hsImportParams Delimiter
    hi! link hsDelimTypeExport Delimiter
    hi! link hsModuleStartLabel hsStructure
    hi! link hsModuleWhereLabel hsModuleStartLabel
    hi hsNiceOperator ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi hsniceoperator ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocTitleBlock ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocTitleBlockTitle ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocTitleComment ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocComment ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi pandocVerbatimBlock ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link pandocVerbatimBlockDeep pandocVerbatimBlock
    hi! link pandocCodeBlock pandocVerbatimBlock
    hi! link pandocCodeBlockDelim pandocVerbatimBlock
    hi pandocBlockQuote ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader1 ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader2 ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader3 ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader4 ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader5 ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocBlockQuoteLeader6 ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocListMarker ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocListReference ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocDefinitionBlock ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocDefinitionTerm ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,standout gui=NONE,standout
    hi pandocDefinitionIndctr ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocEmphasisDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi pandocEmphasisNestedDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisNestedDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisEmphasisDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrikeoutDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi pandocVerbatimInlineDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSuperscriptDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSubscriptDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocTableStructure ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi! link pandocTableStructureTop pandocTableStructre
    hi! link pandocTableStructureEnd pandocTableStructre
    hi pandocTableZebraLight ctermfg=4 ctermbg=8 guifg=#268bd2 guibg=#002b36 guisp=NONE cterm=NONE gui=NONE
    hi pandocTableZebraDark ctermfg=4 ctermbg=0 guifg=#268bd2 guibg=#073642 guisp=NONE cterm=NONE gui=NONE
    hi pandocEmphasisTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi pandocEmphasisNestedTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisNestedTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisEmphasisTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrikeoutTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi pandocVerbatimInlineTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSuperscriptTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSubscriptTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocHeadingMarker ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocEmphasisHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocEmphasisNestedHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisNestedHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisEmphasisHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrikeoutHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi pandocVerbatimInlineHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocSuperscriptHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocSubscriptHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocLinkDelim ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkLabel ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkText ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkURL ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkTitle ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocLinkTitleDelim ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=#657b83 cterm=NONE gui=NONE
    hi pandocLinkDefinition ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#657b83 cterm=NONE gui=NONE
    hi pandocLinkDefinitionID ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocImageCaption ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocFootnoteLink ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocFootnoteDefLink ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocFootnoteInline ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocFootnote ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocCitationDelim ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocCitation ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocCitationID ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocCitationRef ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocStyleDelim ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocEmphasis ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
    hi pandocEmphasisNested ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasis ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisNested ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrongEmphasisEmphasis ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocStrikeout ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi pandocVerbatimInline ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSuperscript ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocSubscript ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocRule ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocRuleLine ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocEscapePair ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi pandocCitationRef ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocNonBreakingSpace ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
    hi! link pandocEscapedCharacter pandocEscapePair
    hi! link pandocLineBreak pandocEscapePair
    hi pandocMetadataDelim ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocMetadata ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocMetadataKey ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
    hi pandocMetadata ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
    hi! link pandocMetadataTitle pandocMetadata
  endif
  if get(g:, "solarized_term_italics", 0)
    hi Comment cterm=italic
    hi gitcommitComment cterm=italic
    hi htmlSpecialTagName cterm=italic
    hi pandocComment cterm=italic
    hi pandocEmphasisDefinition cterm=italic
    hi pandocEmphasisTable cterm=italic
    hi pandocEmphasis cterm=italic
  endif
  if has('nvim')
    hi! link TermCursor Cursor
    hi TermCursorNC ctermfg=8 ctermbg=10 guifg=#002b36 guibg=#586e75 guisp=NONE cterm=NONE gui=NONE
    let g:terminal_color_8='#002b36'
    let g:terminal_color_0='#073642'
    let g:terminal_color_10='#586e75'
    let g:terminal_color_11='#657b83'
    let g:terminal_color_12='#839496'
    let g:terminal_color_14='#93a1a1'
    let g:terminal_color_7='#eee8d5'
    let g:terminal_color_15='#fdf6e3'
    let g:terminal_color_3='#b58900'
    let g:terminal_color_9='#cb4b16'
    let g:terminal_color_1='#dc322f'
    let g:terminal_color_5='#d33682'
    let g:terminal_color_13='#6c71c4'
    let g:terminal_color_4='#268bd2'
    let g:terminal_color_6='#2aa198'
    let g:terminal_color_2='#859900'
  endif
  finish
endif

if !has('gui_running') && get(g:, 'solarized_termtrans', 0)
  hi Normal ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi FoldColumn ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi Folded ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=#fdf6e3 cterm=NONE,bold gui=NONE,bold
  hi LineNr ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi Terminal ctermfg=fg ctermbg=NONE guifg=fg guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi CursorLineNr ctermbg=NONE guifg=NONE
else
  hi Normal ctermfg=11 ctermbg=15 guifg=#657b83 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi FoldColumn ctermfg=11 ctermbg=7 guifg=#657b83 guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
  hi Folded ctermfg=11 ctermbg=7 guifg=#657b83 guibg=#eee8d5 guisp=#fdf6e3 cterm=NONE,bold gui=NONE,bold
  hi LineNr ctermfg=14 ctermbg=7 guifg=#93a1a1 guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
  hi Terminal ctermfg=fg ctermbg=15 guifg=fg guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi CursorLineNr ctermbg=7 guibg=#eee8d5
endif
if get(g:, "solarized_visibility", "") == "high"
  hi CursorLineNr ctermfg=1 guifg=#dc322f cterm=bold gui=bold
  if get(g:, 'solarized_old_cursor_style', 0)
    hi Cursor ctermfg=15 ctermbg=11 guifg=#fdf6e3 guibg=#657b83 guisp=NONE cterm=NONE gui=NONE
  else
    hi Cursor ctermfg=15 ctermbg=1 guifg=#fdf6e3 guibg=#dc322f guisp=NONE cterm=NONE gui=NONE
  endif
  hi MatchParen ctermfg=15 ctermbg=12 guifg=#fdf6e3 guibg=#839496 guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi NonText ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi SpecialKey ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi SpellBad ctermfg=5 ctermbg=15 guifg=#d33682 guibg=#fdf6e3 guisp=#6c71c4 cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
  hi SpellCap ctermfg=5 ctermbg=15 guifg=#d33682 guibg=#fdf6e3 guisp=#6c71c4 cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
  hi SpellLocal ctermfg=3 ctermbg=15 guifg=#b58900 guibg=#fdf6e3 guisp=#cb4b16 cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
  hi SpellRare ctermfg=6 ctermbg=15 guifg=#2aa198 guibg=#fdf6e3 guisp=#cb4b16 cterm=NONE,reverse,underline gui=NONE,reverse,undercurl
  hi Title ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
elseif get(g:, "solarized_visibility", "") == "low"
  hi CursorLineNr ctermfg=14 guifg=#93a1a1 cterm=bold gui=bold
  if get(g:, 'solarized_old_cursor_style', 0)
    hi Cursor ctermfg=15 ctermbg=11 guifg=#fdf6e3 guibg=#657b83 guisp=NONE cterm=NONE gui=NONE
  else
    hi Cursor ctermfg=15 ctermbg=9 guifg=#fdf6e3 guibg=#cb4b16 guisp=NONE cterm=NONE gui=NONE
  endif
  hi MatchParen ctermfg=1 ctermbg=7 guifg=#dc322f guibg=#eee8d5 guisp=NONE cterm=NONE,bold,underline gui=NONE,bold,underline
  hi NonText ctermfg=7 ctermbg=NONE guifg=#eee8d5 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi SpecialKey ctermfg=7 ctermbg=NONE guifg=#eee8d5 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi SpellBad ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
  hi SpellCap ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
  hi SpellLocal ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE,underline gui=NONE,undercurl
  hi SpellRare ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#2aa198 cterm=NONE,underline gui=NONE,undercurl
  hi Title ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
else
  hi CursorLineNr ctermfg=11 guifg=#657b83 cterm=bold gui=bold
  if get(g:, 'solarized_old_cursor_style', 0)
    hi Cursor ctermfg=15 ctermbg=11 guifg=#fdf6e3 guibg=#657b83 guisp=NONE cterm=NONE gui=NONE
  else
    hi Cursor ctermfg=15 ctermbg=9 guifg=#fdf6e3 guibg=#cb4b16 guisp=NONE cterm=NONE gui=NONE
  endif
  hi MatchParen ctermfg=1 ctermbg=7 guifg=#dc322f guibg=#eee8d5 guisp=NONE cterm=NONE,bold,underline gui=NONE,bold,underline
  hi NonText ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi SpecialKey ctermfg=12 ctermbg=7 guifg=#839496 guibg=#eee8d5 guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi SpellBad ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
  hi SpellCap ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=#6c71c4 cterm=NONE,underline gui=NONE,undercurl
  hi SpellLocal ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE,underline gui=NONE,undercurl
  hi SpellRare ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#2aa198 cterm=NONE,underline gui=NONE,undercurl
  hi Title ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
endif
hi ColorColumn ctermfg=NONE ctermbg=7 guifg=NONE guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
hi Conceal ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi CursorColumn ctermfg=NONE ctermbg=7 guifg=NONE guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
hi CursorLine ctermfg=NONE ctermbg=7 guifg=NONE guibg=#eee8d5 guisp=#586e75 cterm=NONE gui=NONE
if get(g:, "solarized_diffmode", "") == "high"
  hi DiffAdd ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi DiffChange ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi DiffDelete ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi DiffText ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
elseif get(g:, "solarized_diffmode", "") == "low"
  hi DiffAdd ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=#859900 cterm=NONE gui=NONE
  hi DiffChange ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=#b58900 cterm=NONE gui=NONE
  hi DiffDelete ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi DiffText ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=#268bd2 cterm=NONE gui=NONE
else
  hi DiffAdd ctermfg=2 ctermbg=7 guifg=#859900 guibg=#eee8d5 guisp=#859900 cterm=NONE gui=NONE
  hi DiffChange ctermfg=3 ctermbg=7 guifg=#b58900 guibg=#eee8d5 guisp=#b58900 cterm=NONE gui=NONE
  hi DiffDelete ctermfg=1 ctermbg=7 guifg=#dc322f guibg=#eee8d5 guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi DiffText ctermfg=4 ctermbg=7 guifg=#268bd2 guibg=#eee8d5 guisp=#268bd2 cterm=NONE gui=NONE
endif
hi Directory ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi EndOfBuffer ctermfg=NONE ctermbg=NONE guifg=NONE guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi ErrorMsg ctermfg=1 ctermbg=15 guifg=#dc322f guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi IncSearch ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,standout gui=NONE,standout
hi ModeMsg ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi MoreMsg ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi Pmenu ctermfg=11 ctermbg=7 guifg=#657b83 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi PmenuSbar ctermfg=0 ctermbg=11 guifg=#073642 guibg=#657b83 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi PmenuSel ctermfg=14 ctermbg=0 guifg=#93a1a1 guibg=#073642 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi PmenuThumb ctermfg=11 ctermbg=15 guifg=#657b83 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi Question ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
hi! link QuickFixLine Search
hi Search ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi SignColumn ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
if get(g:, "solarized_statusline", "") == "low"
  hi StatusLine ctermfg=14 ctermbg=15 guifg=#93a1a1 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi StatusLineNC ctermfg=14 ctermbg=10 guifg=#93a1a1 guibg=#586e75 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi TabLine ctermfg=14 ctermbg=10 guifg=#93a1a1 guibg=#586e75 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi TabLineFill ctermfg=14 ctermbg=10 guifg=#93a1a1 guibg=#586e75 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi TabLineSel ctermfg=10 ctermbg=15 guifg=#586e75 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
else
  hi StatusLine ctermfg=10 ctermbg=7 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi StatusLineNC ctermfg=12 ctermbg=7 guifg=#839496 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi TabLine ctermfg=12 ctermbg=7 guifg=#839496 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi TabLineFill ctermfg=12 ctermbg=7 guifg=#839496 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi TabLineSel ctermfg=10 ctermbg=7 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
endif
hi! link StatusLineTerm StatusLine
hi! link StatusLineTermNC StatusLineNC
hi VertSplit ctermfg=14 ctermbg=14 guifg=#93a1a1 guibg=#93a1a1 guisp=NONE cterm=NONE gui=NONE
hi Visual ctermfg=14 ctermbg=15 guifg=#93a1a1 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi VisualNOS ctermfg=NONE ctermbg=7 guifg=NONE guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi WarningMsg ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
hi WildMenu ctermfg=0 ctermbg=7 guifg=#073642 guibg=#eee8d5 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi! link Boolean Constant
hi! link Character Constant
hi Comment ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
hi! link Conditional Statement
hi Constant ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi! link Define PreProc
hi! link Debug Special
hi! link Delimiter Special
hi Error ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
hi! link Exception Statement
hi! link Float Constant
hi! link Function Identifier
hi Identifier ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi Ignore ctermfg=NONE ctermbg=NONE guifg=NONE guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi! link Include PreProc
hi! link Keyword Statement
hi! link Label Statement
hi! link Macro PreProc
hi! link Number Constant
hi! link Operator Statement
hi! link PreCondit PreProc
hi PreProc ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi! link Repeat Statement
hi Special ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi! link SpecialChar Special
hi! link SpecialComment Special
hi Statement ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi! link StorageClass Type
hi! link String Constant
hi! link Structure Type
hi! link Tag Special
hi Todo ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
hi Type ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi! link Typedef Type
hi Underlined ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
hi! link lCursor Cursor
hi CursorIM ctermfg=NONE ctermbg=fg guifg=NONE guibg=fg guisp=NONE cterm=NONE gui=NONE
hi ToolbarLine ctermfg=NONE ctermbg=7 guifg=NONE guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
hi ToolbarButton ctermfg=10 ctermbg=7 guifg=#586e75 guibg=#eee8d5 guisp=NONE cterm=NONE,bold gui=NONE,bold
hi NormalMode ctermfg=10 ctermbg=15 guifg=#586e75 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi InsertMode ctermfg=6 ctermbg=15 guifg=#2aa198 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi ReplaceMode ctermfg=9 ctermbg=15 guifg=#cb4b16 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi VisualMode ctermfg=5 ctermbg=15 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
hi CommandMode ctermfg=5 ctermbg=15 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE,reverse gui=NONE,reverse
if get(g:, 'solarized_extra_hi_groups', 0)
  hi! link vimVar Identifier
  hi! link vimFunc Function
  hi! link vimUserFunc Function
  hi! link helpSpecial Special
  hi! link vimSet Normal
  hi! link vimSetEqual Normal
  hi vimCommentString ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi vimCommand ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi vimCmdSep ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi helpExample ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi helpOption ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi helpNote ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi helpVim ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi helpHyperTextJump ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi helpHyperTextEntry ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi vimIsCommand ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi vimSynMtchOpt ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi vimSynType ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi vimHiLink ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi vimHiGroup ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi vimGroup ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link diffAdded Statement
  hi! link diffLine Identifier
  hi gitcommitComment ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
  hi! link gitcommitUntracked gitcommitComment
  hi! link gitcommitDiscarded gitcommitComment
  hi! link gitcommitSelected gitcommitComment
  hi gitcommitUnmerged ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi gitcommitOnBranch ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi gitcommitBranch ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link gitcommitNoBranch gitcommitBranch
  hi gitcommitdiscardedtype ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi gitcommitselectedtype ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi gitcommitHeader ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi gitcommitUntrackedFile ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi gitcommitDiscardedFile ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi gitcommitSelectedFile ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi gitcommitUnmergedFile ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi gitcommitFile ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link gitcommitDiscardedArrow gitcommitDiscardedFile
  hi! link gitcommitSelectedArrow gitcommitSelectedFile
  hi! link gitcommitUnmergedArrow gitcommitUnmergedFile
  hi htmlTag ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi htmlEndTag ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi htmlTagN ctermfg=10 ctermbg=NONE guifg=#586e75 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi htmlTagName ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi htmlSpecialTagName ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
  hi htmlArg ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi javaScript ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi perlHereDoc ctermfg=10 ctermbg=15 guifg=#586e75 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi perlVarPlain ctermfg=3 ctermbg=15 guifg=#b58900 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi perlStatementFileDesc ctermfg=6 ctermbg=15 guifg=#2aa198 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi texstatement ctermfg=6 ctermbg=15 guifg=#2aa198 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi texmathzonex ctermfg=3 ctermbg=15 guifg=#b58900 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi texmathmatcher ctermfg=3 ctermbg=15 guifg=#b58900 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi texreflabel ctermfg=3 ctermbg=15 guifg=#b58900 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi rubyDefine ctermfg=10 ctermbg=15 guifg=#586e75 guibg=#fdf6e3 guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link rubySymbol Type
  hi rubyBoolean ctermfg=5 ctermbg=15 guifg=#d33682 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  let hs_highlight_boolean=1
  let hs_highlight_delimiters=1
  hi cPreCondit ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi VarId ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi ConId ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsImport ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsString ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsStructure ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hs_hlFunctionName ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsStatement ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsImportLabel ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hs_OpFunctionName ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hs_DeclareFunction ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsVarSym ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsType ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsTypedef ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsModuleName ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link hsImportParams Delimiter
  hi! link hsDelimTypeExport Delimiter
  hi! link hsModuleStartLabel hsStructure
  hi! link hsModuleWhereLabel hsModuleStartLabel
  hi hsNiceOperator ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi hsniceoperator ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocTitleBlock ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocTitleBlockTitle ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocTitleComment ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocComment ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
  hi pandocVerbatimBlock ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link pandocVerbatimBlockDeep pandocVerbatimBlock
  hi! link pandocCodeBlock pandocVerbatimBlock
  hi! link pandocCodeBlockDelim pandocVerbatimBlock
  hi pandocBlockQuote ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocBlockQuoteLeader1 ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocBlockQuoteLeader2 ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocBlockQuoteLeader3 ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocBlockQuoteLeader4 ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocBlockQuoteLeader5 ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocBlockQuoteLeader6 ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocListMarker ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocListReference ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocDefinitionBlock ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocDefinitionTerm ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,standout gui=NONE,standout
  hi pandocDefinitionIndctr ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocEmphasisDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
  hi pandocEmphasisNestedDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisNestedDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisEmphasisDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrikeoutDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi pandocVerbatimInlineDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocSuperscriptDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocSubscriptDefinition ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocTableStructure ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi! link pandocTableStructureTop pandocTableStructre
  hi! link pandocTableStructureEnd pandocTableStructre
  hi pandocTableZebraLight ctermfg=4 ctermbg=15 guifg=#268bd2 guibg=#fdf6e3 guisp=NONE cterm=NONE gui=NONE
  hi pandocTableZebraDark ctermfg=4 ctermbg=7 guifg=#268bd2 guibg=#eee8d5 guisp=NONE cterm=NONE gui=NONE
  hi pandocEmphasisTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
  hi pandocEmphasisNestedTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisNestedTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisEmphasisTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrikeoutTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi pandocVerbatimInlineTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocSuperscriptTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocSubscriptTable ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocHeadingMarker ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocEmphasisHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocEmphasisNestedHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisNestedHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisEmphasisHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrikeoutHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi pandocVerbatimInlineHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocSuperscriptHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocSubscriptHeading ctermfg=9 ctermbg=NONE guifg=#cb4b16 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocLinkDelim ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocLinkLabel ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocLinkText ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocLinkURL ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocLinkTitle ctermfg=12 ctermbg=NONE guifg=#839496 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocLinkTitleDelim ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=#839496 cterm=NONE gui=NONE
  hi pandocLinkDefinition ctermfg=6 ctermbg=NONE guifg=#2aa198 guibg=NONE guisp=#839496 cterm=NONE gui=NONE
  hi pandocLinkDefinitionID ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocImageCaption ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocFootnoteLink ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocFootnoteDefLink ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocFootnoteInline ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocFootnote ctermfg=2 ctermbg=NONE guifg=#859900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocCitationDelim ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocCitation ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocCitationID ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocCitationRef ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocStyleDelim ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocEmphasis ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE gui=NONE,italic
  hi pandocEmphasisNested ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasis ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisNested ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrongEmphasisEmphasis ctermfg=11 ctermbg=NONE guifg=#657b83 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocStrikeout ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi pandocVerbatimInline ctermfg=3 ctermbg=NONE guifg=#b58900 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocSuperscript ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocSubscript ctermfg=13 ctermbg=NONE guifg=#6c71c4 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocRule ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocRuleLine ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocEscapePair ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi pandocCitationRef ctermfg=5 ctermbg=NONE guifg=#d33682 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocNonBreakingSpace ctermfg=1 ctermbg=NONE guifg=#dc322f guibg=NONE guisp=NONE cterm=NONE,reverse gui=NONE,reverse
  hi! link pandocEscapedCharacter pandocEscapePair
  hi! link pandocLineBreak pandocEscapePair
  hi pandocMetadataDelim ctermfg=14 ctermbg=NONE guifg=#93a1a1 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocMetadata ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocMetadataKey ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE gui=NONE
  hi pandocMetadata ctermfg=4 ctermbg=NONE guifg=#268bd2 guibg=NONE guisp=NONE cterm=NONE,bold gui=NONE,bold
  hi! link pandocMetadataTitle pandocMetadata
endif
if get(g:, "solarized_term_italics", 0)
  hi Comment cterm=italic
  hi gitcommitComment cterm=italic
  hi htmlSpecialTagName cterm=italic
  hi pandocComment cterm=italic
  hi pandocEmphasisDefinition cterm=italic
  hi pandocEmphasisTable cterm=italic
  hi pandocEmphasis cterm=italic
endif
if has('nvim')
  hi! link TermCursor Cursor
  hi TermCursorNC ctermfg=15 ctermbg=14 guifg=#fdf6e3 guibg=#93a1a1 guisp=NONE cterm=NONE gui=NONE
  let g:terminal_color_8='#fdf6e3'
  let g:terminal_color_0='#eee8d5'
  let g:terminal_color_10='#93a1a1'
  let g:terminal_color_11='#839496'
  let g:terminal_color_12='#657b83'
  let g:terminal_color_14='#586e75'
  let g:terminal_color_7='#073642'
  let g:terminal_color_15='#002b36'
  let g:terminal_color_3='#b58900'
  let g:terminal_color_9='#cb4b16'
  let g:terminal_color_1='#dc322f'
  let g:terminal_color_5='#d33682'
  let g:terminal_color_13='#6c71c4'
  let g:terminal_color_4='#268bd2'
  let g:terminal_color_6='#2aa198'
  let g:terminal_color_2='#859900'
endif
finish

" Background: dark
" Color: base03               #002b36                ~        8
" Color: base02               #073642                ~        0
" Color: base01               #586e75                ~        10
" Color: base00               #657b83                ~        11
" Color: base0                #839496                ~        12
" Color: base1                #93a1a1                ~        14
" Color: base2                #eee8d5                ~        7
" Color: base3                #fdf6e3                ~        15
" Color: yellow               #b58900                ~        3
" Color: orange               #cb4b16                ~        9
" Color: red                  #dc322f                ~        1
" Color: magenta              #d33682                ~        5
" Color: violet               #6c71c4                ~        13
" Color: blue                 #268bd2                ~        4
" Color: cyan                 #2aa198                ~        6
" Color: green                #859900                ~        2
" Color: back                 #002b36                ~        8
"   Normal             base0             none
"   FoldColumn         fg                none
"   Folded             fg                none             bold s=base03
"   LineNr             base01            none
"   Terminal           fg                none
"   Normal            base0             back
"   FoldColumn        base0             base02
"   Folded            base0             base02            bold s=base03
"   LineNr            base01            base02
"   Terminal          fg                back
" NonText              orange            none              bold
" SpecialKey           orange            none              reverse
" SpellBad             violet            base3             t=underline,reverse g=undercurl,reverse s=red
" SpellCap             violet            base3             t=underline,reverse g=undercurl,reverse s=red
" SpellLocal           yellow            base3             t=underline,reverse g=undercurl,reverse s=red
" SpellRare            cyan              base3             t=underline,reverse g=undercurl,reverse s=red
" Title                yellow            none              bold
" NonText              base02            none              bold
" SpecialKey           base02            none              reverse
" SpellBad             violet            none              t=underline g=undercurl s=violet
" SpellCap             violet            none              t=underline g=undercurl s=violet
" SpellLocal           yellow            none              t=underline g=undercurl s=yellow
" SpellRare            cyan              none              t=underline g=undercurl s=cyan
" Title                base01            none              bold
" NonText              base00            none              bold
" SpecialKey           base00            base02            bold
" SpellBad             violet            none              t=underline g=undercurl s=violet
" SpellCap             violet            none              t=underline g=undercurl s=violet
" SpellLocal           yellow            none              t=underline g=undercurl s=yellow
" SpellRare            cyan              none              t=underline g=undercurl s=cyan
" Title                yellow            none              bold
" ColorColumn          none              base02
" Conceal              blue              none
" Cursor               base03            base0
" Cursor               base3             blue
" CursorColumn         none              base02
" CursorLine           none              base02            s=base1
" DiffAdd              green             none              reverse
" DiffChange           yellow            none              reverse
" DiffDelete           red               none              reverse
" DiffText             blue              none              reverse
" DiffAdd              green             none              s=green
" DiffChange           yellow            none              s=yellow
" DiffDelete           red               none              bold
" DiffText             blue              none              s=blue
" DiffAdd              green             base02            s=green
" DiffChange           yellow            base02            s=yellow
" DiffDelete           red               base02            bold
" DiffText             blue              base02            s=blue
" Directory            blue              none
" EndOfBuffer          none              none
" ErrorMsg             red               base3             reverse
" IncSearch            orange            none              standout
" MatchParen           base3             base02            bold
" ModeMsg              blue              none
" MoreMsg              blue              none
" Pmenu                base0             base02            reverse
" PmenuSbar            base2             base0             reverse
" PmenuSel             base01            base2             reverse
" PmenuThumb           base0             base03            reverse
" Question             cyan              none              bold
" QuickFixLine     ->  Search
" Search               yellow            none              reverse
" SignColumn           base0             none
" StatusLine           base01            base2             reverse
" StatusLineNC         base01            base02            reverse
" TabLine              base01            base02            reverse
" TabLineFill          base01            base02            reverse
" TabLineSel           base0             base3             reverse
" StatusLine           base0             base02            reverse
" StatusLineNC         base01            base02            reverse
" TabLine              base01            base02            reverse
" TabLineFill          base01            base02            reverse
" TabLineSel           base0             base02            reverse
" StatusLineTerm    -> StatusLine
" StatusLineTermNC  -> StatusLineNC
" VertSplit            base01            base01
" Visual               base01            base03            reverse
" VisualNOS            none              base02            reverse
" WarningMsg           orange            none              bold
" WildMenu             base2             base02            reverse
" Boolean           -> Constant
" Character         -> Constant
" Comment              base01            none              g=italic
" Conditional       -> Statement
" Constant             cyan              none
" Define            -> PreProc
" Debug             -> Special
" Delimiter         -> Special
" Error                red               none              bold
" Exception         -> Statement
" Float             -> Constant
" Function          -> Identifier
" Identifier           blue              none
" Ignore               none              none
" Include           -> PreProc
" Keyword           -> Statement
" Label             -> Statement
" Macro             -> PreProc
" Number            -> Constant
" Operator          -> Statement
" PreCondit         -> PreProc
" PreProc              orange            none
" Repeat            -> Statement
" Special              orange            none
" SpecialChar       -> Special
" SpecialComment    -> Special
" Statement            green             none
" StorageClass      -> Type
" String            -> Constant
" Structure         -> Type
" Tag               -> Special
" Todo                 magenta           none              bold
" Type                 yellow            none
" Typedef           -> Type
" Underlined           violet            none
" lCursor           -> Cursor
" CursorIM             none              fg
" ToolbarLine          none              base02
" ToolbarButton        base1             base02            bold
" NormalMode           base0             base3             reverse
" InsertMode           cyan              base3             reverse
" ReplaceMode          orange            base3             reverse
" VisualMode           magenta           base3             reverse
" CommandMode          magenta           base3             reverse
" vimVar            -> Identifier
" vimFunc           -> Function
" vimUserFunc       -> Function
" helpSpecial       -> Special
" vimSet            -> Normal
" vimSetEqual       -> Normal
" vimCommentString     violet            none
" vimCommand           yellow            none
" vimCmdSep            blue              none              bold
" helpExample          base1             none
" helpOption           cyan              none
" helpNote             magenta           none
" helpVim              magenta           none
" helpHyperTextJump    blue              none
" helpHyperTextEntry   green             none
" vimIsCommand         base00            none
" vimSynMtchOpt        yellow            none
" vimSynType           cyan              none
" vimHiLink            blue              none
" vimHiGroup           blue              none
" vimGroup             blue              none              bold
" diffAdded         -> Statement
" diffLine          -> Identifier
" gitcommitComment           base01          none              g=italic
" gitcommitUntracked      -> gitcommitComment
" gitcommitDiscarded      -> gitcommitComment
" gitcommitSelected       -> gitcommitComment
" gitcommitUnmerged          green           none              bold
" gitcommitOnBranch          base01          none              bold
" gitcommitBranch            magenta         none              bold
" gitcommitNoBranch       -> gitcommitBranch
" gitcommitdiscardedtype     red             none
" gitcommitselectedtype      green           none
" gitcommitHeader            base01          none
" gitcommitUntrackedFile     cyan            none              bold
" gitcommitDiscardedFile     red             none              bold
" gitcommitSelectedFile      green           none              bold
" gitcommitUnmergedFile      yellow          none              bold
" gitcommitFile              base0           none              bold
" gitcommitDiscardedArrow -> gitcommitDiscardedFile
" gitcommitSelectedArrow  -> gitcommitSelectedFile
" gitcommitUnmergedArrow  -> gitcommitUnmergedFile
" htmlTag                    base01          none
" htmlEndTag                 base01          none
" htmlTagN                   base1           none              bold
" htmlTagName                blue            none              bold
" htmlSpecialTagName         blue            none              g=italic
" htmlArg                    base00          none
" javaScript                 yellow          none
" perlHereDoc                base1           back
" perlVarPlain               yellow          back
" perlStatementFileDesc      cyan            back
" texstatement               cyan            back
" texmathzonex               yellow          back
" texmathmatcher             yellow          back
" texreflabel                yellow          back
" rubyDefine                 base1           back              bold
" rubySymbol              -> Type
" rubyBoolean                magenta         back
" cPreCondit                 orange          none
" VarId                      blue            none
" ConId                      yellow          none
" hsImport                   magenta         none
" hsString                   base00          none
" hsStructure                cyan            none
" hs_hlFunctionName          blue            none
" hsStatement                cyan            none
" hsImportLabel              cyan            none
" hs_OpFunctionName          yellow          none
" hs_DeclareFunction         orange          none
" hsVarSym                   cyan            none
" hsType                     yellow          none
" hsTypedef                  cyan            none
" hsModuleName               green           none
" hsImportParams          -> Delimiter
" hsDelimTypeExport       -> Delimiter
" hsModuleStartLabel      -> hsStructure
" hsModuleWhereLabel      -> hsModuleStartLabel
" hsNiceOperator             cyan            none
" hsniceoperator             cyan            none
" pandocTitleBlock                       blue               none
" pandocTitleBlockTitle                  blue               none           bold
" pandocTitleComment                     blue               none           bold
" pandocComment                          base01             none           g=italic
" pandocVerbatimBlock                    yellow             none
" pandocVerbatimBlockDeep             -> pandocVerbatimBlock
" pandocCodeBlock                     -> pandocVerbatimBlock
" pandocCodeBlockDelim                -> pandocVerbatimBlock
" pandocBlockQuote                       blue               none
" pandocBlockQuoteLeader1                blue               none
" pandocBlockQuoteLeader2                cyan               none
" pandocBlockQuoteLeader3                yellow             none
" pandocBlockQuoteLeader4                red                none
" pandocBlockQuoteLeader5                base0              none
" pandocBlockQuoteLeader6                base01             none
" pandocListMarker                       magenta            none
" pandocListReference                    magenta            none
" pandocDefinitionBlock                  violet             none
" pandocDefinitionTerm                   violet             none           standout
" pandocDefinitionIndctr                 violet             none           bold
" pandocEmphasisDefinition               violet             none           g=italic
" pandocEmphasisNestedDefinition         violet             none           bold
" pandocStrongEmphasisDefinition         violet             none           bold
" pandocStrongEmphasisNestedDefinition   violet             none           bold
" pandocStrongEmphasisEmphasisDefinition violet             none           bold
" pandocStrikeoutDefinition              violet             none           reverse
" pandocVerbatimInlineDefinition         violet             none
" pandocSuperscriptDefinition            violet             none
" pandocSubscriptDefinition              violet             none
" pandocTable                            blue               none
" pandocTableStructure                   blue               none
" pandocTableStructureTop             -> pandocTableStructre
" pandocTableStructureEnd             -> pandocTableStructre
" pandocTableZebraLight                  blue               base03
" pandocTableZebraDark                   blue               base02
" pandocEmphasisTable                    blue               none           g=italic
" pandocEmphasisNestedTable              blue               none           bold
" pandocStrongEmphasisTable              blue               none           bold
" pandocStrongEmphasisNestedTable        blue               none           bold
" pandocStrongEmphasisEmphasisTable      blue               none           bold
" pandocStrikeoutTable                   blue               none           reverse
" pandocVerbatimInlineTable              blue               none
" pandocSuperscriptTable                 blue               none
" pandocSubscriptTable                   blue               none
" pandocHeading                          orange             none           bold
" pandocHeadingMarker                    orange             none           bold
" pandocEmphasisHeading                  orange             none           bold
" pandocEmphasisNestedHeading            orange             none           bold
" pandocStrongEmphasisHeading            orange             none           bold
" pandocStrongEmphasisNestedHeading      orange             none           bold
" pandocStrongEmphasisEmphasisHeading    orange             none           bold
" pandocStrikeoutHeading                 orange             none           reverse
" pandocVerbatimInlineHeading            orange             none           bold
" pandocSuperscriptHeading               orange             none           bold
" pandocSubscriptHeading                 orange             none           bold
" pandocLinkDelim                        base01             none
" pandocLinkLabel                        blue               none
" pandocLinkText                         blue               none
" pandocLinkURL                          base00             none
" pandocLinkTitle                        base00             none
" pandocLinkTitleDelim                   base01             none           s=base00
" pandocLinkDefinition                   cyan               none           s=base00
" pandocLinkDefinitionID                 blue               none           bold
" pandocImageCaption                     violet             none           bold
" pandocFootnoteLink                     green              none
" pandocFootnoteDefLink                  green              none           bold
" pandocFootnoteInline                   green              none           bold
" pandocFootnote                         green              none
" pandocCitationDelim                    magenta            none
" pandocCitation                         magenta            none
" pandocCitationID                       magenta            none
" pandocCitationRef                      magenta            none
" pandocStyleDelim                       base01             none
" pandocEmphasis                         base0              none           g=italic
" pandocEmphasisNested                   base0              none           bold
" pandocStrongEmphasis                   base0              none           bold
" pandocStrongEmphasisNested             base0              none           bold
" pandocStrongEmphasisEmphasis           base0              none           bold
" pandocStrikeout                        base01             none           reverse
" pandocVerbatimInline                   yellow             none
" pandocSuperscript                      violet             none
" pandocSubscript                        violet             none
" pandocRule                             blue               none           bold
" pandocRuleLine                         blue               none           bold
" pandocEscapePair                       red                none           bold
" pandocCitationRef                      magenta            none
" pandocNonBreakingSpace                 red                none           reverse
" pandocEscapedCharacter              -> pandocEscapePair
" pandocLineBreak                     -> pandocEscapePair
" pandocMetadataDelim                    base01             none
" pandocMetadata                         blue               none
" pandocMetadataKey                      blue               none
" pandocMetadata                         blue               none           bold
" pandocMetadataTitle                 -> pandocMetadata
" TermCursor        -> Cursor
" TermCursorNC         base03            base01
" Background: light
" Color: base3                #002b36                ~        8
" Color: base2                #073642                ~        0
" Color: base1                #586e75                ~        10
" Color: base0                #657b83                ~        11
" Color: base00               #839496                ~        12
" Color: base01               #93a1a1                ~        14
" Color: base02               #eee8d5                ~        7
" Color: base03               #fdf6e3                ~        15
" Color: yellow               #b58900                ~        3
" Color: orange               #cb4b16                ~        9
" Color: red                  #dc322f                ~        1
" Color: magenta              #d33682                ~        5
" Color: violet               #6c71c4                ~        13
" Color: blue                 #268bd2                ~        4
" Color: cyan                 #2aa198                ~        6
" Color: green                #859900                ~        2
" Color: back                 #fdf6e3                ~        15
"   Normal             base0             none
"   FoldColumn         base0             none
"   Folded             base0             none              bold s=base03
"   LineNr             base01            none
"   Terminal           fg                none
"   Normal            base0             back
"   FoldColumn        base0             base02
"   Folded            base0             base02            bold s=base03
"   LineNr            base01            base02
"   Terminal          fg                back
" Cursor               base03            base0
" Cursor               base03            red
" MatchParen           base03            base00            bold
" NonText              red               none              bold
" SpecialKey           red               none              reverse
" SpellBad             magenta           base03            t=underline,reverse g=undercurl,reverse s=violet
" SpellCap             magenta           base03            t=underline,reverse g=undercurl,reverse s=violet
" SpellLocal           yellow            base03            t=underline,reverse g=undercurl,reverse s=orange
" SpellRare            cyan              base03            t=underline,reverse g=undercurl,reverse s=orange
" Title                orange            none              bold
" Cursor               base03            base0
" Cursor               base03            orange
" MatchParen           red               base02            bold,underline
" NonText              base02            none              bold
" SpecialKey           base02            none              bold
" SpellBad             magenta           none              t=underline g=undercurl s=violet
" SpellCap             magenta           none              t=underline g=undercurl s=violet
" SpellLocal           yellow            none              t=underline g=undercurl s=yellow
" SpellRare            cyan              none              t=underline g=undercurl s=cyan
" Title                base01            none              bold
" Cursor               base03            base0
" Cursor               base03            orange
" MatchParen           red               base02            bold,underline
" NonText              base00            none              bold
" SpecialKey           base00            base02            bold
" SpellBad             magenta           none              t=underline g=undercurl s=violet
" SpellCap             magenta           none              t=underline g=undercurl s=violet
" SpellLocal           yellow            none              t=underline g=undercurl s=yellow
" SpellRare            cyan              none              t=underline g=undercurl s=cyan
" Title                orange            none              bold
" ColorColumn          none              base02
" Conceal              blue              none
" CursorColumn         none              base02
" CursorLine           none              base02            s=base1
" DiffAdd              green             none              reverse
" DiffChange           yellow            none              reverse
" DiffDelete           red               none              reverse
" DiffText             blue              none              reverse
" DiffAdd              green             none              s=green
" DiffChange           yellow            none              s=yellow
" DiffDelete           red               none              bold
" DiffText             blue              none              s=blue
" DiffAdd              green             base02            s=green
" DiffChange           yellow            base02            s=yellow
" DiffDelete           red               base02            bold
" DiffText             blue              base02            s=blue
" Directory            blue              none
" EndOfBuffer          none              none
" ErrorMsg             red               base03            reverse
" IncSearch            orange            none              standout
" ModeMsg              blue              none
" MoreMsg              blue              none
" Pmenu                base0             base02            reverse
" PmenuSbar            base2             base0             reverse
" PmenuSel             base01            base2             reverse
" PmenuThumb           base0             base03            reverse
" Question             cyan              none              bold
" QuickFixLine     ->  Search
" Search               yellow            none              reverse
" SignColumn           base0             none
" StatusLine           base01            base03            reverse
" StatusLineNC         base01            base1             reverse
" TabLine              base01            base1             reverse
" TabLineFill          base01            base1             reverse
" TabLineSel           base1             base03            reverse
" StatusLine           base1             base02            reverse
" StatusLineNC         base00            base02            reverse
" TabLine              base00            base02            reverse
" TabLineFill          base00            base02            reverse
" TabLineSel           base1             base02            reverse
" StatusLineTerm    -> StatusLine
" StatusLineTermNC  -> StatusLineNC
" VertSplit            base01            base01
" Visual               base01            base03            reverse
" VisualNOS            none              base02            reverse
" WarningMsg           orange            none              bold
" WildMenu             base2             base02            reverse
" Boolean           -> Constant
" Character         -> Constant
" Comment              base01            none              g=italic
" Conditional       -> Statement
" Constant             cyan              none
" Define            -> PreProc
" Debug             -> Special
" Delimiter         -> Special
" Error                red               none              bold
" Exception         -> Statement
" Float             -> Constant
" Function          -> Identifier
" Identifier           blue              none
" Ignore               none              none
" Include           -> PreProc
" Keyword           -> Statement
" Label             -> Statement
" Macro             -> PreProc
" Number            -> Constant
" Operator          -> Statement
" PreCondit         -> PreProc
" PreProc              orange            none
" Repeat            -> Statement
" Special              orange            none
" SpecialChar       -> Special
" SpecialComment    -> Special
" Statement            green             none
" StorageClass      -> Type
" String            -> Constant
" Structure         -> Type
" Tag               -> Special
" Todo                 magenta           none              bold
" Type                 yellow            none
" Typedef           -> Type
" Underlined           violet            none
" lCursor           -> Cursor
" CursorIM             none              fg
" ToolbarLine          none              base02
" ToolbarButton        base1             base02            bold
" NormalMode           base1             base03            reverse
" InsertMode           cyan              base03            reverse
" ReplaceMode          orange            base03            reverse
" VisualMode           magenta           base03            reverse
" CommandMode          magenta           base03            reverse
" vimVar            -> Identifier
" vimFunc           -> Function
" vimUserFunc       -> Function
" helpSpecial       -> Special
" vimSet            -> Normal
" vimSetEqual       -> Normal
" vimCommentString     violet            none
" vimCommand           yellow            none
" vimCmdSep            blue              none              bold
" helpExample          base1             none
" helpOption           cyan              none
" helpNote             magenta           none
" helpVim              magenta           none
" helpHyperTextJump    blue              none
" helpHyperTextEntry   green             none
" vimIsCommand         base00            none
" vimSynMtchOpt        yellow            none
" vimSynType           cyan              none
" vimHiLink            blue              none
" vimHiGroup           blue              none
" vimGroup             blue              none              bold
" diffAdded         -> Statement
" diffLine          -> Identifier
" gitcommitComment           base01          none              g=italic
" gitcommitUntracked      -> gitcommitComment
" gitcommitDiscarded      -> gitcommitComment
" gitcommitSelected       -> gitcommitComment
" gitcommitUnmerged          green           none              bold
" gitcommitOnBranch          base01          none              bold
" gitcommitBranch            magenta         none              bold
" gitcommitNoBranch       -> gitcommitBranch
" gitcommitdiscardedtype     red             none
" gitcommitselectedtype      green           none
" gitcommitHeader            base01          none
" gitcommitUntrackedFile     cyan            none              bold
" gitcommitDiscardedFile     red             none              bold
" gitcommitSelectedFile      green           none              bold
" gitcommitUnmergedFile      yellow          none              bold
" gitcommitFile              base0           none              bold
" gitcommitDiscardedArrow -> gitcommitDiscardedFile
" gitcommitSelectedArrow  -> gitcommitSelectedFile
" gitcommitUnmergedArrow  -> gitcommitUnmergedFile
" htmlTag                    base01          none
" htmlEndTag                 base01          none
" htmlTagN                   base1           none              bold
" htmlTagName                blue            none              bold
" htmlSpecialTagName         blue            none              g=italic
" htmlArg                    base00          none
" javaScript                 yellow          none
" perlHereDoc                base1           back
" perlVarPlain               yellow          back
" perlStatementFileDesc      cyan            back
" texstatement               cyan            back
" texmathzonex               yellow          back
" texmathmatcher             yellow          back
" texreflabel                yellow          back
" rubyDefine                 base1           back              bold
" rubySymbol              -> Type
" rubyBoolean                magenta         back
" cPreCondit                 orange          none
" VarId                      blue            none
" ConId                      yellow          none
" hsImport                   magenta         none
" hsString                   base00          none
" hsStructure                cyan            none
" hs_hlFunctionName          blue            none
" hsStatement                cyan            none
" hsImportLabel              cyan            none
" hs_OpFunctionName          yellow          none
" hs_DeclareFunction         orange          none
" hsVarSym                   cyan            none
" hsType                     yellow          none
" hsTypedef                  cyan            none
" hsModuleName               green           none
" hsImportParams          -> Delimiter
" hsDelimTypeExport       -> Delimiter
" hsModuleStartLabel      -> hsStructure
" hsModuleWhereLabel      -> hsModuleStartLabel
" hsNiceOperator             cyan            none
" hsniceoperator             cyan            none
" pandocTitleBlock                       blue               none
" pandocTitleBlockTitle                  blue               none           bold
" pandocTitleComment                     blue               none           bold
" pandocComment                          base01             none           g=italic
" pandocVerbatimBlock                    yellow             none
" pandocVerbatimBlockDeep             -> pandocVerbatimBlock
" pandocCodeBlock                     -> pandocVerbatimBlock
" pandocCodeBlockDelim                -> pandocVerbatimBlock
" pandocBlockQuote                       blue               none
" pandocBlockQuoteLeader1                blue               none
" pandocBlockQuoteLeader2                cyan               none
" pandocBlockQuoteLeader3                yellow             none
" pandocBlockQuoteLeader4                red                none
" pandocBlockQuoteLeader5                base0              none
" pandocBlockQuoteLeader6                base01             none
" pandocListMarker                       magenta            none
" pandocListReference                    magenta            none
" pandocDefinitionBlock                  violet             none
" pandocDefinitionTerm                   violet             none           standout
" pandocDefinitionIndctr                 violet             none           bold
" pandocEmphasisDefinition               violet             none           g=italic
" pandocEmphasisNestedDefinition         violet             none           bold
" pandocStrongEmphasisDefinition         violet             none           bold
" pandocStrongEmphasisNestedDefinition   violet             none           bold
" pandocStrongEmphasisEmphasisDefinition violet             none           bold
" pandocStrikeoutDefinition              violet             none           reverse
" pandocVerbatimInlineDefinition         violet             none
" pandocSuperscriptDefinition            violet             none
" pandocSubscriptDefinition              violet             none
" pandocTable                            blue               none
" pandocTableStructure                   blue               none
" pandocTableStructureTop             -> pandocTableStructre
" pandocTableStructureEnd             -> pandocTableStructre
" pandocTableZebraLight                  blue               base03
" pandocTableZebraDark                   blue               base02
" pandocEmphasisTable                    blue               none           g=italic
" pandocEmphasisNestedTable              blue               none           bold
" pandocStrongEmphasisTable              blue               none           bold
" pandocStrongEmphasisNestedTable        blue               none           bold
" pandocStrongEmphasisEmphasisTable      blue               none           bold
" pandocStrikeoutTable                   blue               none           reverse
" pandocVerbatimInlineTable              blue               none
" pandocSuperscriptTable                 blue               none
" pandocSubscriptTable                   blue               none
" pandocHeading                          orange             none           bold
" pandocHeadingMarker                    orange             none           bold
" pandocEmphasisHeading                  orange             none           bold
" pandocEmphasisNestedHeading            orange             none           bold
" pandocStrongEmphasisHeading            orange             none           bold
" pandocStrongEmphasisNestedHeading      orange             none           bold
" pandocStrongEmphasisEmphasisHeading    orange             none           bold
" pandocStrikeoutHeading                 orange             none           reverse
" pandocVerbatimInlineHeading            orange             none           bold
" pandocSuperscriptHeading               orange             none           bold
" pandocSubscriptHeading                 orange             none           bold
" pandocLinkDelim                        base01             none
" pandocLinkLabel                        blue               none
" pandocLinkText                         blue               none
" pandocLinkURL                          base00             none
" pandocLinkTitle                        base00             none
" pandocLinkTitleDelim                   base01             none           s=base00
" pandocLinkDefinition                   cyan               none           s=base00
" pandocLinkDefinitionID                 blue               none           bold
" pandocImageCaption                     violet             none           bold
" pandocFootnoteLink                     green              none
" pandocFootnoteDefLink                  green              none           bold
" pandocFootnoteInline                   green              none           bold
" pandocFootnote                         green              none
" pandocCitationDelim                    magenta            none
" pandocCitation                         magenta            none
" pandocCitationID                       magenta            none
" pandocCitationRef                      magenta            none
" pandocStyleDelim                       base01             none
" pandocEmphasis                         base0              none           g=italic
" pandocEmphasisNested                   base0              none           bold
" pandocStrongEmphasis                   base0              none           bold
" pandocStrongEmphasisNested             base0              none           bold
" pandocStrongEmphasisEmphasis           base0              none           bold
" pandocStrikeout                        base01             none           reverse
" pandocVerbatimInline                   yellow             none
" pandocSuperscript                      violet             none
" pandocSubscript                        violet             none
" pandocRule                             blue               none           bold
" pandocRuleLine                         blue               none           bold
" pandocEscapePair                       red                none           bold
" pandocCitationRef                      magenta            none
" pandocNonBreakingSpace                 red                none           reverse
" pandocEscapedCharacter              -> pandocEscapePair
" pandocLineBreak                     -> pandocEscapePair
" pandocMetadataDelim                    base01             none
" pandocMetadata                         blue               none
" pandocMetadataKey                      blue               none
" pandocMetadata                         blue               none           bold
" pandocMetadataTitle                 -> pandocMetadata
" TermCursor        -> Cursor
" TermCursorNC         base03            base01

