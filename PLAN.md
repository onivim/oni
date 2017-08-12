- Create a non-plugin based neovim editor
- Override window navigation commands
- Fix left pane to 250px
- Create `deactivate`, `activate` concepts

- Share common code between SimpleEditor / OniEditor

- File explorer window
    - Fixed window to the left
    - Window navigation
        - http://blog.paulrugelhiatt.com/vim/2014/10/31/vim-tip-automatically-create-window-splits-with-movement.html
        - Command: `oni.window.moveLeft`, `oni.window.moveRight`, `oni.window.moveUp`, `oni.window.moveDown`
        - WindowManager - multiple Neovim editor instances
