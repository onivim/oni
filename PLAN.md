- Switching files between workspace
    - Switching between workspace files causes crash as new language service is instantiated - can the root project be used?
    - reason-of-life - good example

- Bring over default highlighting & indent behavior from vim-reason

- Python - syntax highlighting issue
    - Investigate error in python language service - is it due to our LSP client or general issue with the language server?

- Completion: Why are details not showing?

- Update README with support instructions
- Port to Bucklescript

- Error cases
    - Windows: no tooling
    - Linux
    - Test with no `ocaml-language-server` in path

- Test with OCaml as well (.ml/.mli)

### Dependent issues:
    - Notification issue

### Separate issues:
    - How to express keyword from language server plugin?
    - Hook up show message
    - Possibilities for visualizing typings? The typing resolution in VSCode is very helpful, but intrusive. I wonder if there is another UX that would be helpful here.

    - Log issue for live evaluation
        - Configurable "export" to use as live evaluation - ie, let live => ...

    - Log issue for playground
