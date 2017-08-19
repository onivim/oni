- `activeEditor.mode` isn't working correctly
- Add `neovim` capability to activeEditor, that can be queried

- Add option to hide commands in screen

- Create these 'commands' in `Commands.ts`:

quickOpen.show/quickOpen.show.files
quickOpen.show.bufferLines
quickOpen.close
quickOpen.select.open
quickOpen.select.openSplitHorizontal
quickOpen.select.openSplitVertical

completion.complete

menu.next
menu.previous

- Hook up bindings to these commands
