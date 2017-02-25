- Take full buffer update and figure out if only a line has changed
    - Algorithm to check for changes from top down
    - Algorithm to check for changes from bottom up

    - Wire up bufferUpdateService to index.tsx, plumb, and make sure autocompletion / changes work correctly

    - Check for mode (normal / insert)
        - Add event listener
        - If mode is normal, always send full buffer updates on changes
        - If mode is insert, and line is same, and number of bufferlines are the same, send incremental updates
        - When mode goes back to normal, flush and send the full buffer update

    - Console logging on full buffer update / incremental buffer update
        - Way to log only in debug mode?

- Change eventContext -> context in buffer-update to match other events

DONE:

- Test out `change` method in tsserver
    - Way to validate current file
    - Always change line2 to `window`
    - Command to change line in current file
    - Where to save file

