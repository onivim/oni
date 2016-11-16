set number
set relativenumber
set noswapfile
set ruler

" Default tab settings
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab

set list
set listchars=trail:·

" Use system clipboard
set clipboard=unnamed

let g:ctrlp_user_command = 'cd %s && git ls-files'
let g:ctrlp_use_caching = 0
" no limit
let g:ctrlp_max_files = 0
let g:ctrlp_max_depth = 40
let g:ctrlp_match_window = 'bottom,order:btt,min:1,max:10,results:50'
"let g:ctrlp_by_filename = 1
let g:ctrlp_working_path_mode = 0

${runtimepaths}

" colorscheme Monokai
" set rtp+=C:\users\bryanphe\vimfiles\bundle\ctrlp.vim

