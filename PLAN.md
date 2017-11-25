- Bring in batched subscribe -> investigate typing predictions issue

[1hr]
- Insert mode woes
    - When pressing enter, it gets messed up, because the calculations for lower lines are problematic
    - If we're in insert mode, only care about the range we're working on
        - UPDATE_BUFFER_LINE
    - If we're in normal mode (or larger update), use top/bottom visible

[1hr]
- handle tsx files

- Do a pass over reason files

- good info here:

- Add info in the wiki:
    https://www.sublimetext.com/docs/3/scope_naming.html
