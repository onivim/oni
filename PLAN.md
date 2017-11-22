

- set up textmate from config
- hook up current buffer viewport to syntax reconciler

- JavaScript
- TypeScript

POST CSS work:
- grammar loading - create `IGrammarLoader`, wire up to plugin metadata
    - dependent on CSS change?
    - decouple from current implementation

- Initial language set:
    - CSS
    - LESS
    - SASS
    - Reason

- create action
    - SET_BUFFER_VIEWPORT
        bufferId
        topLine // top line that is visible
        bottomLine // bottom line that is visible

- create lines reducer
    - SYNTAX_UPDATE_BUFFER_LINE
        - increment version of all buffers above
        - update line but not version of current line
    - SYNTAX_UPDATE_BUFFER
        - increment version to latest if line hasn't changed
        - maybe this could happen in `getSyntaxTokensForBuffers`?
        - otherwise, update line but not version
        - keep track of latest version
        - when file changes, update token from top - the first line that is < currentVersion

    - With this in place, instead of passing '0' to `getSyntaxTokensForBuffer`, we can search downward for the first line that version !== currentVersion. Minimize the 'tokens' in the general case.

    - Need to update logic in reconciler to check line and rulestack, as the version bump will mean the `!==` check will succeed, even in cases where it hasn't really changed.



- good info here:
    https://www.sublimetext.com/docs/3/scope_naming.html

- set highlights
    - use a batch call (nvim_call_atomic)

- do some better diffing in the reconciler
    - only send current viewport lines
        - hook up current viewport to state

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

- config driven
    - match against `editor.tokenColors`
        - and later against theme color...

- add `oni-languages` node_module

NEXT:
    - Update renderer to listen to current viewport, and only set highlights for the viewport
    - Update set highlights in BufferManager to be atomic

- Themes?
    - TextMate offers higher fidelity scopes than what is available in Neovim, so it'd be nice to hook up theming integration to this (#412 & #33)

- Loading textmate packages?
    - VSCode has a high-quality set of curated themes here: 
        - https://github.com/Microsoft/vscode/tree/master/extensions/
        - Would be great to package that up as `oni-languages` and see if we can reuse those for a majority of languages
    - ReasonML has snippets + syntaxes here:
        - https://github.com/reasonml-editor/vscode-reasonml

- Architecture
    - Split up into systems
        - Create a _renderer_ to reconcile syntax highlight updates with the current view
            - renderer tracks current window state and decides if the 
        - Add function in the buffer to set highlights (and maintain state so we don't keep setting the same ones over and over)
            - activeBuffer.getOrCreateHighlight(string | { }) => id
            - activeBuffer.setHighlightAt(range, highlightGroup)

- Measure and instrument performance
- Add flag to enable / disable this (can reuse the `enhancedSyntaxHighlighting` configuration option?)
