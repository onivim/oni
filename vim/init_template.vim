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

" Helpers for command mode
" %% for current buffer file name
" :: for current buffer file path
cnoremap %% <C-R>=fnameescape(expand('%'))<CR>
cnoremap :: <C-R>=fnameescape(expand('%:p:h'))<CR>/

${runtimepaths}

" colorscheme Monokai
" set rtp+=C:\users\bryanphe\vimfiles\bundle\ctrlp.vim

