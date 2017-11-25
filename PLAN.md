[1hr]
- Get tests passing
- Add selector / rationalize places that use `topLine` and `bottomLine`
- Add `START_INSERT_MODE` and `END_INSERT_MODE` action
- Add `isInsertMode` to state
- Add `currentInsertModeLine` to state

[1hr]
- Insert mode woes
    - When pressing enter, it gets messed up, because the calculations for lower lines are problematic
    - If we're in insert mode, only care about the range we're working on
        - UPDATE_BUFFER_LINE
    - If we're in normal mode (or larger update), use top/bottom visible

    - Refactor to `topLine` and `bottomLine`
        - in `normal` mode, this corresponds to the `viewport`
        - in `insert` mode, this corresponds to the range of the edit
            topEdit
            bottomEdit

    - Add START_INSERT_MODE and END_INSERT_MODE action
    - START_INSERT_MODE
        - set isInsertMode = true
        - clear insert range
    - END_INSERT_MODE
        - Set isInsertMode = false

    - Add Selectors.getRange to get visible range
        - if `isInsertMode` get the current range
        - otherwise get viewport

    - When ending insert mode, get the latest line content and update

[1hr]
- handle tsx files

- Do a pass over reason files

- good info here:

- Add info in the wiki:
    https://www.sublimetext.com/docs/3/scope_naming.html
