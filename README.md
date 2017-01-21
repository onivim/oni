[![Build Status](https://travis-ci.org/extr0py/oni.svg?branch=master)](https://travis-ci.org/extr0py/oni)
# Oni
![alt text](./images/Oni_128.png)
## Neovim + JavaScript powered IDE

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
    - [NPM](#install-from-npm)
    - [Build](#build)
- [Documentation](#documentation)
    - [Usage](#usage)
        - [Code Completion](#code-completion)
        - [Fuzzy Finder](#fuzzy-finder)
        - [Quick Info](#quick-info)
    - [Configuration](#configuration)
    - [Extensibility](#extensibility)
    - [FAQ](#faq)
- [Roadmap](#roadmap)
- [License](#license)
- [Contributing](#contributing)
- [Thanks](#thanks)

## Introduction

ONI is a [NeoVim](https://github.com/neovim/neovim) front-end UI with rich IDE-like UI integration points, drawing inspiration from [VSCode](https://github.com/Microsoft/vscode), [Atom](https://atom.io/), and [LightTable](http://lighttable.com/)

This repository is under __active development__, and until 1.0 please consider everything unstable.

> `npm install -g oni-vim`

> `oni`

## Features

ONI brings several IDE-like integrations to NeoVim:

- **[Quick Info](#quick-info)**

![quick-info-demo](http://i.imgur.com/TlIH97w.gif)

- **[Code Completion](#code-completion)**

![completion-demo](http://i.imgur.com/DVkaIBI.gif)

- **Syntax / Compilation Errors**

![syntax-error-demo](http://i.imgur.com/3ErOKYI.gif)

- **[Fuzzy Finding](#fuzzy-finder)**

![fuzzy-finder-demo](http://i.imgur.com/wYnvcT6.gif)

- **Live Evaluation**

![live-eval-demo](http://i.imgur.com/XenTrdC.gif)

## Installation

- For Windows, a pre-built x86 binary of NeoVim is included.

- For OSX and Linux, there is no included pre-built binary. Please [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available.

### Install from NPM

1) Run `npm install -g oni-vim`

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

### Usage

#### Code Completion

Code completion is a commonly requested add-on to Vim, and the most common solutions are to use a plugin like [YouCompleteMe](https://github.com/Valloric/YouCompleteMe), [deoplete](https://github.com/Shougo/deoplete.nvim), or [AutoComplPop](https://github.com/vim-scripts/AutoComplPop).

These are all great plugins - but they all have the same fundamental issue that they are bounded by the limitations of the Vim terminal UI, and as such, can never be quite up-to-par with new editors that do not have such limitations. In addition, some require an involved installation process. The goal of code completion in ONI is to be able to break free of these restrictions, and provide the same richness that modern editors like Atom or VSCode provide for completion.

##### Entry point

If a [language extension](#language-extensibility) is available for a language, then that language service will be queried as you type, and if there are completions available, those will be presented automatically.

> Out of the box, the only supported languages for rich completion are JavaScript and TypeScript. These leverage the TypeScript Language Service which requires either a tsconfig.json or a jsconfig.json at the root of the project. You can use an empty json file with `{}` to get the rich completion.

##### Commands

- `<C-n>` - navigate to next entry in the completion menu
- `<C-p>` - navigate to previous entry in the completion menu
- `<Enter>` - selected completion item
- `<Esc>` - close the completion menu

##### Options

- `oni.useExternalPopupMenu` - if set to _true_, will render the Vim popupmenu in the same UI as the language extension menu, so that it has a consistent look and feel. If set to _false_, will fallback to allow Neovim to render the menu.

#### Fuzzy Finder

Fuzzy Finder is a quick and easy way to switch between files. It's similiar in goal to the Ctrl-P plugin, and the built-in functionality editors like VSCode and Atom provide.

##### Entry point
- `<C-p>` - show the Fuzzy Finder menu

##### Commands
- `<C-n>` - navigate to next entry in the Fuzzy Finder menu
- `<C-p>` - navigate to the previous entry in the Fuzzy Finder menu
- `<Enter>` - select a Fuzzy Finder item
- `<Esc>` - close the Fuzzy Finder menu

By default, Fuzzy Finder uses `git ls-files` to get the available files in the directory, but if git is not present, it will fallback to a non-git strategy.

The Fuzzy Finder strategy can be configured by the `editor.quickOpen.execCommand`, and must be a shell command that returns a list of files, separated by newlines.

#### Quick Info

Quick Info gives a quick summary of an identifier when the cursor is held on it. JavaScript and TypeScript is supported out of the box.

##### Entry point

Leave the cursor hovering over an identifier.

##### Options

- `oni.quickInfo.enabled` - If set to `true`, the Quick Info feature is enabled. (Default: `true`)
- `oni.quickInfo.delay` - Delay in milliseconds for the Quick Info window to show. (Default: `500`)


### Configuration

> ONI is configurable via a 'config.json' located in $HOME/.oni

Here's an example config.json:
```
{
    "oni.useDefaultConfig": true,
    "oni.loadInitVim": true,
    "editor.fontSize": "14px",
    "editor.fontFamily": "Monaco",
    "editor.completions.enabled": true
}
```

A few interesting configuration options to set:
- `oni.audio.bellUrl` - Set a custom sound effect for the `bell` (`:help bell`). The value should be an _absolute path_ to a supported audio file, such as a WAV file.
- `oni.useDefaultConfig` - ONI comes with an opinionated default set of plugins for a predictable out-of-box experience. This will be great for newcomes to ONI or Vim, but for Vim/Neovim veterans, this will likely conflict. Set this to `false` to avoid loading the default config, and to load settings from `init.vim` instead (If this is false, it implies `oni.loadInitVim` is true)
- `oni.loadInitVim` - This determines whether the user's `init.vim` is loaded. Use caution when setting this to `true` and setting `oni.useDefaultConfig` to true, as there could be conflicts with the default configuration.
- `editor.fontSize` - Font size
- `editor.fontFamily` - Font family
- `prototype.editor.backgroundImageUrl` - specific a custom background image
- `prototype.editor.backgroundImageSize` - specific a custom background size (cover, contain)

See the `Config.ts` file for other interesting values to set.

In VimL, the `g:gui_oni` variable will be set to `1`, and can be validated with `if exists("g:gui_oni")` in VimL.

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

To see the in-progress API, check out the [Oni.d.ts](https://github.com/extr0py/oni/blob/master/definitions/Oni.d.ts) definition file as well as the [typescript language plugin](https://github.com/extr0py/oni/tree/master/vim/core/oni-plugin-typescript), which demonstrates several of these features:

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
- [vim-unimpaired](https://github.com/tpope/vim-unimpaired)

As well as some color-schemes:
- [vim-monokai](https://github.com/sickill/vim-monokai)
- [onedark.vim](https://github.com/joshdick/onedark.vim)

## Roadmap

See [roadmap](ROADMAP.md)

## License

MIT License. Copyright (c) extropygames

The bundled plugins have their own license terms, along with the bundled Neovim binary

## Contributing

Contributions are very much welcome :)

If you're interested in helping out, check out [CONTRIBUTING.md](./CONTRIBUTING.md) for tips and tricks for working with ONI.

# Thanks

Big thanks to the NeoVim team - without their work, this project would not be possible. The deep integration with VIM would not be possible without the incredible work that was done to enable the msgpack-RPC interface. Thanks!

Also, big thanks to our [contributors](https://github.com/extr0py/oni/graphs/contributors) for helping out!

In addition, there are several other great NeoVim front-end UIs [here](https://github.com/neovim/neovim/wiki/Related-projects) that served as great reference points and learning opportunities.

There are a few image and audio assets bundled with Oni - see [ASSETS.md](ASSETS.md) for attribution.
