Start using JS for keybindings:
- `keybindings.js`
- Format like:
```
{
    "<C-PageUp>": "editor.quickOpen.show",
    "<C-PageDown>": {
        "normal": "editor.quickOpen.show",
        "insert": "..."
    },
    "<Enter>": (context) => { ... }
}
```

- Add configuration: default keybindings
- Load keybindings asynchronously

- Add performance profiling for loading keybindings
- Refactor the hardcoded bindings to use the new format

- Update documentation
