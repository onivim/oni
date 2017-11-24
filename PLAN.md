

[1hr]
- Debug - where is the syntax highlighting breaking down?
    - WHy isn't first line getting highlighted?

- Expose state globally
- Minimal repro
- Show token scopes
    - Add setting `debug.textMateHighlighting.showScopesInQuickInfo"

- [1hr]
- why isn't highlighting happening immediately?
- put limit on syntax highlight (editor.textMateHighlighting.maxLines)
- put limit on batch size (editor.textMateHighlighting.batchSize)

[1hr]
- handle tsx files

https://code.visualstudio.com/blogs/2017/02/08/syntax-highlighting-optimizations
- May not need to clear lines below, if the rulestack is unchanged
- Check end state to see if an update is needed
- How does this relate to lines being changed?

- Optimizations on the highlight pipeline
    - store 'language' in the store
    - add a 'VIEWPORT_UPDATE' epic
        - need to recalculate highlight tokens in that case
        - need to get language from call...

- In the `getSyntaxTokensForBuffer`, we'd look for the first line where ruleStack is null, and start evaluating from there, and we wouldn't need to do any clearing... we'd just send the results for the lines we do care about

- good info here:
    https://www.sublimetext.com/docs/3/scope_naming.html

- set highlights
    - use a batch call (nvim_call_atomic)

- only update viewable portion
    - Update renderer to listen to current viewport, and only set highlights for the viewport
