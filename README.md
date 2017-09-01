![alt text](./assets/oni-header.png)

### IDE powered by Neovim + React + Electron

[![Build Status](https://travis-ci.org/extr0py/oni.svg?branch=master)](https://travis-ci.org/extr0py/oni)
[![Build Status](https://ci.appveyor.com/api/projects/status/gum9hty9hm65o7ae/branch/master?svg=true)](https://ci.appveyor.com/project/extr0py/oni/branch/master)
[![Join the chat at https://gitter.im/extr0py/Lobby](https://badges.gitter.im/extr0py/Lobby.svg)](https://gitter.im/extr0py/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![BountySource Active Bounties](https://api.bountysource.com/badge/tracker?tracker_id=48462304)](https://www.bountysource.com/teams/oni)

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
    - [Windows](#windows)
    - [Mac](#mac)
    - [Linux](#linux)
    - [Build](#build)
- [Documentation](#documentation)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [License](#license)
- [Contributing](#contributing)
- [Thanks](#thanks)
    - [Sponsors](#sponsors)

## Introduction

ONI is a [NeoVim](https://github.com/neovim/neovim) front-end UI with rich IDE-like UI integration points, drawing inspiration from [VSCode](https://github.com/Microsoft/vscode), [Atom](https://atom.io/), and [LightTable](http://lighttable.com/)

![screenshot](https://user-images.githubusercontent.com/13532591/28976286-25779704-78f2-11e7-967f-72cb438d77f6.png)

This repository is under __active development__, and until 1.0 please consider everything unstable.

Check out [Releases](https://github.com/extr0py/oni/releases) for the latest binaries, or [Build Oni](#build) from source.

## Features

ONI brings several IDE-like integrations to NeoVim:

- **[Quick Info](https://github.com/extr0py/oni/wiki/Usage#quick-info)**

![quick-info-demo](http://i.imgur.com/0vJ8KgU.gif)

- **[Code Completion](https://github.com/extr0py/oni/wiki/Usage#code-completion)**

![completion-demo](http://i.imgur.com/exdasXs.gif)

- **Syntax / Compilation Errors**

![syntax-error-demo](http://i.imgur.com/GUBhRhG.gif)

- **[Fuzzy Finding](https://github.com/extr0py/oni/wiki/Usage#fuzzy-finder)**

![fuzzy-finder-demo](http://i.imgur.com/wYnvcT6.gif)

- **[Status Bar](https://github.com/extr0py/oni/wiki/Usage#status-bar)**

![status-bar-demo](http://i.imgur.com/2grzeN1.gif)

## Installation

Check out [Releases](https://github.com/extr0py/oni/releases) for the latest binary.

Windows & OSX releases come with a bundled Neovim release.

### Windows

- Download the [Oni installer](https://github.com/extr0py/oni/releases/download/v0.2.8/Oni-0.2.8-ia32-win.exe) for Windows
- Once it is downloaded, run the installer. This will only take a minute.
- By default, Oni is installed under `C:\Program Files (x86)\Oni` for a 64-bit machine. 

You can also find install via a [zip archive](https://github.com/extr0py/oni/releases/download/v0.2.8/Oni-0.2.8-ia32-win.zip)

> You may want to add Oni to your `%PATH%`, so that from the console, you can open Oni via `oni`

### Mac

- Download [Oni](https://github.com/extr0py/oni/releases/download/v0.2.8/Oni-0.2.8-osx.dmg) for Mac
- Double-click on the archive to expand
- Drag `Oni.app` to the `Applications` folder

### Linux

#### Debian and Ubuntu based distributions

> If you do not have Neovim, follow the instructions to [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available. Version `0.2.0` is required..

- Download the [.deb package (64-bit)](https://github.com/extr0py/oni/releases/download/v0.2.8/oni_0.2.8_amd64.deb)
- Install the package with `sudo dpkg -i <file>.deb`

A [tar.gz](https://github.com/extr0py/oni/releases/download/v0.2.8/oni-0.2.8.tar.gz) is also available.

#### Red Hat based distributions (Fedora, CentOS)

> If you do not have Neovim, follow the instructions to [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available. Version `0.2.0` is required..

- Download the [.rpm package](https://github.com/extr0py/oni/releases/download/v0.2.8/oni-0.2.8.rpm)
- Install the package with `sudo dnf install <file>.rpm`

A [tar.gz](https://github.com/extr0py/oni/releases/download/v0.2.8/oni-0.2.8.tar.gz) is also available.

#### Arch based distributions

- Available via the [AUR](https://aur.archlinux.org/packages/oni/)
- Install the package with `yaourt -S oni`

A [tar.gz](https://github.com/extr0py/oni/releases/download/v0.2.8/oni-0.2.8.tar.gz) is also available.

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

Please see the [Wiki](https://github.com/extr0py/oni/wiki) for documentation on how to use and modify Oni.

### FAQ

#### Why isn't my init.vim loaded?

> _TL;DR_ - Set the `oni.useDefaultConfig` configuration value to _false_

By default, Oni has an opinionated, prescribed set of plugins, in order to facilitate a predictable out-of-box experience that highlights the additional UI integration points. However, this will likely have conflicts with a Vim/Neovim veteran's finely-honed configuration.

To avoid loading the Oni defaults, and instead use your `init.vim`, set `oni.useDefaultConfig` to false in `$HOME/.oni/config.js`.  See [Configuration](https://github.com/extr0py/oni/wiki/Configuration) for more details on configuring Oni.

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

See [Roadmap](https://github.com/extr0py/oni/wiki/Roadmap)

## License

MIT License. Copyright (c) extropygames

There are a few image and audio assets bundled with Oni - see [ASSETS.md](ASSETS.md) for attribution.

Windows and OSX have a bundled version of Neovim, which is covered under [Neovim's license](https://github.com/neovim/neovim/blob/master/LICENSE)

#### Bundled Plugins

Bundled plugins have their own license terms. These include:
- [typescript-vim](https://github.com/leafgarland/typescript-vim) (`oni/vim/core/typescript.vim`)
- [targets.vim](https://github.com/wellle/targets.vim) (`oni/vim/default/bundle/targets.vim`)
- [vim-commentary](https://github.com/tpope/vim-commentary) (`oni/vim/default/bundle/vim-commentary`)
- [vim-unimpaired](https://github.com/tpope/vim-unimpaired) (`oni/vim/default/bundle/vim-unimpaired`)
- [vim-reasonml](https://github.com/reasonml-editor/vim-reason) (`.vim` files in `oni/vim/core/oni-plugin-reasonml`)

## Contributing

Contributions are very much welcome :)

If you're interested in helping out, check out our [Debugging Page](https://github.com/extr0py/oni/wiki/Debugging) for tips and tricks for working with ONI.

## Thanks

Big thanks to the NeoVim team - without their work, this project would not be possible. The deep integration with VIM would not be possible without the incredible work that was done to enable the msgpack-RPC interface. Thanks!

### Sponsors

A big THANK YOU to our current monthly sponsors. Your contributions help keep this project alive!

- [Mike Hartington](https://github.com/mhartington)

### Other Contributions

In addition, there are several other great NeoVim front-end UIs [here](https://github.com/neovim/neovim/wiki/Related-projects) that served as great reference points and learning opportunities.

Also, thanks to our [contributors](https://github.com/extr0py/oni/graphs/contributors) for helping out!

Special thanks to [Till Arnold](https://github.com/tillarnold) for handing over the `oni` NPM package name.
