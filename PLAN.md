- Update README with support instructions

- Why is completion not working with `ocaml-language-server` in Oni?
    - Is it due to not returning a request from `giveWordAtPosition`? Or a sync issue? Need to check and see what is being sent to Merlin

- Investigate why JS types aren't being resolved (like "Js.Promise.resolve") - is this a general issue for `ocaml-language-server` or Oni specific?

- Possibilities for visualizing typings? The typing resolution in VSCode is very helpful, but intrusive. I wonder if there is another UX that would be helpful here.

- Port to Bucklescript

- Windows: Show error message
- Linux: Need to test

- Log issue for live evaluation
    - Configurable "export" to use as live evaluation - ie, let live => ...

- Log issue for playground
