- Create own directory plugin?
    - netrw not lightweight, pollutes clipboard history

- Override window navigation commands
    - File explorer window
        - Fixed window to the left
        - Window navigation
            - http://blog.paulrugelhiatt.com/vim/2014/10/31/vim-tip-automatically-create-window-splits-with-movement.html
            - Command: `oni.window.moveLeft`, `oni.window.moveRight`, `oni.window.moveUp`, `oni.window.moveDown`
            - WindowManager - multiple Neovim editor instances

- Window focus management
    - Create Window Manager
    - Have focus managed
    - Pull keyboard out externally, have focused window handle input
        - Keyboard focus for active window
    - Create `deactivate`, `activate` concepts for editor
    - Push `onKeyDown` to editor
    - How to keep from 'drilling in' to file?

- Rename scenario?
    - Lightweight editor

- Custom renderer
    - Use React rendering strategy
        - Props:
            - string[]
            - lineSize
            - selectedLine
    - Add file / folder icons

- Share common code between SimpleEditor / OniEditor

- Separate 'IDE' UI functionality from 'Core' functionality
    - Split
    - Core
        - fontPixelWidth
        - fontPixelHeight
        - backgroundColor
        - foregroundColor
        - popupMenu
        - configuration
        - statusBar
        - logs
        - activeMessageDialog
    - Editor
        - cursor
        - mode
        - autoCompletion
        - quickInfo
        - signatureHelp
        - cursorLinevisible
        - cursorLineOpacity
        - tabs
        - buffers
        - activeWindowDimensions
        - windows
