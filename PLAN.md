- Syntax highlighting
    - Support document symbol

- Full document sync - why is it not working?

- Completion: Why are details not showing?
- Does 'workspace/didChangeWathcedFiles' need to be supported?

- Update README with support instructions
- Investigate why JS types aren't being resolved (like "Js.Promise.resolve") - is this a general issue for `ocaml-language-server` or Oni specific?
- Port to Bucklescript

- Windows: Show error message
- Linux: Need to test
- Test with no `ocaml-language-server` in path

### Dependent issues:
    - Notification issue
    - Syntax highlight issue

### Separate issues:
    - Hook up show message
    - Possibilities for visualizing typings? The typing resolution in VSCode is very helpful, but intrusive. I wonder if there is another UX that would be helpful here.

    - Log issue for live evaluation
        - Configurable "export" to use as live evaluation - ie, let live => ...

    - Log issue for playground
