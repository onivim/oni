NEXT:
    - Update renderer to listen to current viewport, and only set highlights for the viewport
    - Update set highlights in BufferManager to be atomic
    - Implement non-string highlight groups
    - Add real logic to get the highlight group
    - Add atomic call for sending in highlight groups

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
