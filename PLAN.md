- handle tsx files

- put limit on syntax highlight (editor.textMateHighlighting.maxLines)

- `BufferManager` - handle the delta results that come from `BufferHighlightUpdater`
    - Remove duplicates of `linesToUpdate`
    - Remove duplicates of `linesToClear`

- Optimizations on the highlight pipeline
    - store 'language' in the store
    - add a 'VIEWPORT_UPDATE' epic
        - need to recalculate highlight tokens in that case
        - need to get language from call...

- Hook up single-line buffer update
    - In reducer, update the line at index for that buffer
    - That should allow us to reuse the logic in the syntax tokens
        - working top down, all the previous ones should be the same...
        - only ones underneath current edited row would change...
        - and remaining ones out of screen would be invalidated...
    - Do we still need version?

- Hook up multi-line buffer update
    - Perhaps this can handle the 'clearing' logic?
        - do the initial traversal, clear all rulestacks

- Hook up single-line buffer update
    - clear all rulestacks passed the update

- In the `getSyntaxTokensForBuffer`, we'd look for the first line where ruleStack is null, and start evaluating from there, and we wouldn't need to do any clearing... we'd just send the results for the lines we do care about

- good info here:
    https://www.sublimetext.com/docs/3/scope_naming.html

- set highlights
    - use a batch call (nvim_call_atomic)

- only update viewable portion
    - Update renderer to listen to current viewport, and only set highlights for the viewport

- `experimental.editor.syntaxHighlighting.enabled` configuration

- setHighlights in buffer
    - `src_id` - if we request at the start of the operation, for a single line, can we use it on all lines?



    - doesRangeOverlap(testRange, ranges)

    - replaceHighlight(newHighlight, oldHighlights): highlights

    - incremental changes - only update tokens that need to be updated
        - Only update lines that have changed
        - Merge token
            - is it already there? if so, don't change
            - if not, filter out overlaps + add

        // src_id = buffer_id + "_hl_line_ " + line

        - Keep track of current highlight state
            { [line: number]: HighlightInfo[] }

        - Grab a new token
        - { [line] { src_id: id, highlightInfo[]: info }}

    - use a batch call
    - only update viewable portion

- Measure and instrument performance
