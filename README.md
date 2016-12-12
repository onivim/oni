[![Build Status](https://travis-ci.org/extr0py/oni.svg?branch=master)](https://travis-ci.org/extr0py/oni)
# Oni
![alt text](./images/Oni_128.png)
## Neovim + JavaScript powered IDE

- [Introduction](#introduction)
- [Features](#features)
- [Documentation](#documentation)
    - [Configuration](#configuration)
    - [Guide](#guide)
    - [Extensibility](#extensibility)
    - [FAQ](#faq)
- [Roadmap](#roadmap)
- [License](#license)
- [Contributing](#contributing)
- [Thanks](#thanks)

## Introduction

ONI is a NeoVim front-end UI with rich IDE-like UI integration points, drawing inspiration from [VSCode](https://github.com/Microsoft/vscode), [Atom](https://atom.io/), and [LightTable](http://lighttable.com/)

This repository is under __active development__, and until 1.0 please consider everything unstable.

## Features

ONI brings several IDE-like integrations to NeoVim:

### Quick Info

![quick-info-demo](http://i.imgur.com/TlIH97w.gif)

### Code Completion

![completion-demo](http://i.imgur.com/DVkaIBI.gif)

### Syntax / Compilation Errors

![syntax-error-demo](http://i.imgur.com/3ErOKYI.gif)

### Fuzzy Finder

![fuzzy-finder-demo](http://i.imgur.com/wYnvcT6.gif)

### Live Evaluation

![live-eval-demo](http://i.imgur.com/XenTrdC.gif)

## Usage

### Install

- For Windows, a pre-built x86 binary of NeoVim is included.

- For OSX, there is no included pre-built binary. Please [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim.exe' is available.

1) Run npm install -g oni-vim

2) Run `oni` at the command line to start the editor.

### Build

1) Clone the repository: `git clone https://github.com/extr0py/oni.git`

2) Install dependencies by running `npm install` from the root

3) Build using `npm run build` from the root

4) Run `npm link` to register the *ONI* command

5) Run `oni` at the command line

## Goals

The goal of this project is to provide both the full-fledged VIM experience, with no compromises, while pushing forward to enable new scenarios.

- __Modern UX__ - The VIM experience should not be compromised with poor user experiences that stem from terminal limitations.
- __Rich plugin development__ - using JavaScript, instead of VimL, allowing deep-language integration.
- __Cross-platform support__ - across Windows, OS X, and Linux.
- __Batteries included__ - rich features are available out of the box - minimal setup needed to be productive. TypeScript development is the canonical example, but the hope is that other language providers will be included. Later, an included package manager will make it simple to find and install plugins.
- __Performance__ - no compromises, VIM is fast, and ONI should be fast too.
- __Ease Learning Curve__ - without sacrificing the VIM experience

VIM is an incredible tool for manipulating *text* at the speed of thought. With a composable, modal command language, it is no wonder that VIM usage is still prevalent today even in the realm of modern editors.

However, going from thought to *code* has some different challenges than going from thought to *text*. IDEs today provide several benefits that help to reduce __cognitive load__ when writing code, and that benefit is tremendously important - not only in terms of pure coding efficiency and productivity, but also in making the process of writing code enjoyable and fun.

In my journey of learning VIM and increasing proficiency in other editors, I've found there is always a trade-off - either enjoy the autocompletion and IDE features, and compromise on the experience and muscle memory I've built with VIM, or work in VIM and compromise on the rich language functionality we have in an IDE.

The goal of this project is to give an editor that gives the best of both worlds - the power, speed, and flexibility of using VIM for manipulating text, as well as the rich tooling that comes with an IDE.

## Documentation

### Configuration

> ONI is configurable via a 'config.json' located in $HOME/.oni

Here's an example config.json:
```
{
    "oni.useDefaultConfig": true,
    "editor.fontSize": "14px",
    "editor.fontFamily": "Monaco",
    "editor.completions.enabled": true
}
```

A few interesting configuration options to set:
- `oni.useDefaultConfig` - ONI comes with an opinionated default set of plugins for a predictable out-of-box experience. This will be great for newcomes to ONI or Vim, but for Vim/Neovim veterans, this will likely conflict. Set this to `false` to avoid loading the default config, and to load settings from `init.vim` instead.
- `editor.fontSize` - Font size
- `editor.fontFamily` - Font family
- `prototype.editor.backgroundImageUrl` - specific a custom background image
- `prototype.editor.backgroundImageSize` - specific a custom background size (cover, contain)

See the `Config.ts` file for other interesting values to set

### Guide

TODO: Coming soon. 

### Extensibility

ONI offers several rich extensibility points, with the focus being on various UI integrations as well as IDE-like capabilities.

#### Language Extensibility

Language extenders given ONI rich integration with languages, offering services like:

- Code Completion
- Quick Info
- Goto Definition
- Formatting
- Live code evaluation
- Unit test integration
- Enhanced syntax highlighting

To see the in-progress API, check out the [Oni.d.ts](https://github.com/extr0py/oni/blob/master/definitions/Oni.d.ts) definition file as well as the [typescript language plugin](https://github.com/extr0py/oni/tree/master/vim/vimfiles/bundle/oni-plugin-typescript), which demonstrates several of these features:

#### Background

ONI currently supports the setting of a background image as well as background opacity.

#### Debuggers

#### Project Templates

#### Snippets

### FAQ

#### Why isn't my init.vim loaded?

> _TL;DR_ - Set the `oni.useDefaultConfig` configuration value to _false_

By default, Oni has an opinionated, prescribed set of plugins, in order to facilitate a predictable out-of-box experience that highlights the additional UI integration points. However, this will likely have conflicts with a Vim/Neovim veteran's finely-honed configuration.

To avoid loading the Oni defaults, and instead use your `init.vim`, set this configuration value to false in $HOME/.oni/config.json.

### Included VIM Plugins

This distribution contains several VIM plugins that enhance the VIM experience.

These are:
- [targets.vim](https://github.com/wellle/targets.vim)
- [typescript-vim](https://github.com/leafgarland/typescript-vim)
- [vim-commentary](https://github.com/tpope/vim-commentary)

As well as some color-schemes:
- [vim-monokai](https://github.com/sickill/vim-monokai)
- [onedark.vim](https://github.com/joshdick/onedark.vim)

## Roadmap

See [roadmap](ROADMAP.md)

## License

MIT

## Contributing

Contributions are very much welcome :)

# Thanks

Big thanks to the NeoVim team - without their work, this project would not be possible. The deep integration with VIM would not be possible without the incredible work that was done to enable the msgpack-RPC interface. Thanks!

Also, big thanks to our [contributors](https://github.com/extr0py/oni/graphs/contributors) for helping out!

In addition, there are several other great NeoVim front-end UIs [here](https://github.com/neovim/neovim/wiki/Related-projects) that served as great reference points and learning opportunities.
