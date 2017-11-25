- Insert mode woes
    - When pressing enter, it gets messed up, because the calculations for lower lines are problematic
    - If we're in insert mode, only care about the range we're working on
        - UPDATE_BUFFER_LINE
    - If we're in normal mode (or larger update), use top/bottom visible

[1hr]
- Why does the `export interface` case fail for `test.ts`?
- Why are diagnostics going crazy in `npm run start` when going to NeovimInstance?
- put limit on syntax highlight (editor.textMateHighlighting.maxLines)
- put limit on batch size (editor.textMateHighlighting.batchSize)

[1hr]
- handle tsx files

- Fix token issues, add additional tokens for Reason

- good info here:

- Add info in the wiki:
    https://www.sublimetext.com/docs/3/scope_naming.html
