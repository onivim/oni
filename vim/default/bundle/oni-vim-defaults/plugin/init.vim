set number
set noswapfile
set ruler
set smartcase

set splitright
set splitbelow

" Default tab settings
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab

set list
set listchars=trail:·

" Helpers for command mode
" %% for current buffer file name
" :: for current buffer file path
cnoremap %% <C-R>=fnameescape(expand('%'))<CR>
cnoremap :: <C-R>=fnameescape(expand('%:p:h'))<CR>/

" Make Control+nav keys functionality in insert mode
inoremap <expr> <C-a> pumvisible() ? "<Esc>A" : "<C-o>A"
inoremap <expr> <C-b> pumvisible() ? "<Esc>bi" : "<C-o>b"
inoremap <expr> <C-l> pumvisible() ? "<Esc>la" : "<C-o>a"

colorscheme onedark
