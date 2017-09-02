# FAQ

### Why isn't my init.vim loaded?

> _TL;DR_ - Set the `oni.useDefaultConfig` configuration value to _false_

By default, Oni has an opinionated, prescribed set of plugins, in order to facilitate a predictable out-of-box experience that highlights the additional UI integration points. However, this will likely have conflicts with a Vim/Neovim veteran's finely-honed configuration.

To avoid loading the Oni defaults, and instead use your `init.vim`, set this configuration value to false in $HOME/.oni/config.json.

