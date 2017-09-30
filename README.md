![alt text](./assets/oni-header.png)

### IDE powered by Neovim + React + Electron

[![Build Status](https://travis-ci.org/bryphe/oni.svg?branch=master)](https://travis-ci.org/bryphe/oni)
[![Build Status](https://ci.appveyor.com/api/projects/status/gum9hty9hm65o7ae/branch/master?svg=true)](https://ci.appveyor.com/project/bryphe/oni/branch/master)
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
- [Roadmap](#roadmap)
- [License](#license)
- [Contributing](#contributing)
- [Thanks](#thanks)
    - [Sponsors](#sponsors)

## Introduction

Oni is a [NeoVim](https://github.com/neovim/neovim) front-end UI with rich IDE-like UI integration points, drawing inspiration from [VSCode](https://github.com/Microsoft/vscode), [Atom](https://atom.io/), and [LightTable](http://lighttable.com/)

![screenshot](https://user-images.githubusercontent.com/13532591/28976286-25779704-78f2-11e7-967f-72cb438d77f6.png)

This repository is under __active development__, and until 1.0 please consider everything unstable.

Check out [Releases](https://github.com/bryphe/oni/releases) for the latest binaries, or [Build Oni](#build) from source.

## Features

Oni brings several IDE-like integrations to NeoVim:

- **[Quick Info](https://github.com/bryphe/oni/wiki/Features#quick-info)**

![quick-info-demo](http://i.imgur.com/0vJ8KgU.gif)

- **[Code Completion](https://github.com/bryphe/oni/wiki/Features#code-completion)**

![completion-demo](http://i.imgur.com/exdasXs.gif)

- **Syntax / Compilation Errors**

![syntax-error-demo](http://i.imgur.com/GUBhRhG.gif)

- **[Fuzzy Finding](https://github.com/bryphe/oni/wiki/Features#fuzzy-finder)**

![fuzzy-finder-demo](http://i.imgur.com/wYnvcT6.gif)

- **[Status Bar](https://github.com/bryphe/oni/wiki/Features#status-bar)**

![status-bar-demo](http://i.imgur.com/2grzeN1.gif)

## Installation

Check out [Releases](https://github.com/bryphe/oni/releases) for the latest binary.

Windows & OSX releases come with a bundled Neovim release.

### Windows

- Download the [Oni installer](https://github.com/bryphe/oni/releases/download/v0.2.9/Oni-0.2.9-ia32-win.exe) for Windows
- Once it is downloaded, run the installer. This will only take a minute.
- By default, Oni is installed under `C:\Program Files (x86)\Oni` for a 64-bit machine. 

You can also find install via a [zip archive](https://github.com/bryphe/oni/releases/download/v0.2.9/Oni-0.2.9-ia32-win.zip)

> You may want to add Oni to your `%PATH%`, so that from the console, you can open Oni via `oni`

### Mac

- Download [Oni](https://github.com/bryphe/oni/releases/download/v0.2.9/Oni-0.2.9-osx.dmg) for Mac
- Double-click on the archive to expand
- Drag `Oni.app` to the `Applications` folder

### Linux

#### Debian and Ubuntu based distributions

> If you do not have Neovim, follow the instructions to [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available. Version `0.2.1` is required..

- Download the [.deb package (64-bit)](https://github.com/bryphe/oni/releases/download/v0.2.9/Oni-0.2.9-amd64-linux.deb)
- Install the package with `sudo dpkg -i <file>.deb`

A [tar.gz](https://github.com/bryphe/oni/releases/download/v0.2.9/Oni-0.2.9-linux.tar.gz) is also available.

#### Red Hat based distributions (Fedora, CentOS)

> If you do not have Neovim, follow the instructions to [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available. Version `0.2.1` is required..

- Download the [.rpm package](https://github.com/bryphe/oni/releases/download/v0.2.9/Oni-0.2.9-x86_64-linux.rpm)
- Install the package with `sudo dnf install <file>.rpm`

A [tar.gz](https://github.com/bryphe/oni/releases/download/v0.2.9/Oni-0.2.9-linux.tar.gz) is also available.

#### Arch based distributions

- Available via the [AUR](https://aur.archlinux.org/packages/oni/)
- Install the package with `yaourt -S oni`

A [tar.gz](https://github.com/bryphe/oni/releases/download/v0.2.9/Oni-0.2.9-linux.tar.gz) is also available.

### Build

> Ensure all dependencies for [node-gyp](https://github.com/nodejs/node-gyp) are installed, as some modules require building native code.

1) Clone the repository: `git clone https://github.com/bryphe/oni.git`

2) Install dependencies by running `npm install` from the root

3) Build using `npm run build` from the root

4) Run `npm link` to register the *oni* command

5) Run `oni` at the command line

## Goals

The goal of this project is to provide both the full-fledged Vim experience, with no compromises, while pushing forward to enable new scenarios.

- __Modern UX__ - The Vim experience should not be compromised with poor user experiences that stem from terminal limitations.
- __Rich plugin development__ - using JavaScript, instead of VimL, allowing deep-language integration.
- __Cross-platform support__ - across Windows, OS X, and Linux.
- __Batteries included__ - rich features are available out of the box - minimal setup needed to be productive. TypeScript development is the canonical example, but the hope is that other language providers will be included. Later, an included package manager will make it simple to find and install plugins.
- __Performance__ - no compromises, Vim is fast, and Oni should be fast too.
- __Ease Learning Curve__ - without sacrificing the Vim experience

Vim is an incredible tool for manipulating *text* at the speed of thought. With a composable, modal command language, it is no wonder that Vim usage is still prevalent today even in the realm of modern editors.

However, going from thought to *code* has some different challenges than going from thought to *text*. IDEs today provide several benefits that help to reduce __cognitive load__ when writing code, and that benefit is tremendously important - not only in terms of pure coding efficiency and productivity, but also in making the process of writing code enjoyable and fun.

In my journey of learning Vim and increasing proficiency in other editors, I've found there is always a trade-off - either enjoy the autocompletion and IDE features, and compromise on the experience and muscle memory I've built with Vim, or work in Vim and compromise on the rich language functionality we have in an IDE.

The goal of this project is to give an editor that gives the best of both worlds - the power, speed, and flexibility of using Vim for manipulating text, as well as the rich tooling that comes with an IDE.

## Documentation

- Check out the [Wiki](https://github.com/bryphe/oni/wiki) for documentation on how to use and modify Oni.
- [FAQ](https://github.com/bryphe/oni/wiki)
- [Roadmap](https://github.com/bryphe/oni/wiki/Roadmap)

### Included Vim Plugins

This distribution contains several Vim plugins that enhance the Vim experience.

These are:
- [targets.vim](https://github.com/wellle/targets.vim)
- [typescript-vim](https://github.com/leafgarland/typescript-vim)
- [vim-commentary](https://github.com/tpope/vim-commentary)
- [vim-unimpaired](https://github.com/tpope/vim-unimpaired)

As well as some color-schemes:
- [vim-monokai](https://github.com/sickill/vim-monokai)
- [onedark.vim](https://github.com/joshdick/onedark.vim)

## Roadmap

See [Roadmap](https://github.com/bryphe/oni/wiki/Roadmap)

## License

MIT License. Copyright (c) Bryan Phelps

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

If you're interested in helping out, check out our [Debugging Page](https://github.com/bryphe/oni/wiki/Debugging) for tips and tricks for working with Oni.

## Thanks

Big thanks to the NeoVim team - without their work, this project would not be possible. The deep integration with Vim would not be possible without the incredible work that was done to enable the msgpack-RPC interface. Thanks!

### Sponsors

A big THANK YOU to our current monthly sponsors. Your contributions help keep this project alive!

- [Mike Hartington](https://github.com/mhartington)

### Other Contributions

In addition, there are several other great NeoVim front-end UIs [here](https://github.com/neovim/neovim/wiki/Related-projects) that served as great reference points and learning opportunities.

Also, thanks to our [contributors](https://github.com/bryphe/oni/graphs/contributors) for helping out!

Special thanks to [Till Arnold](https://github.com/tillarnold) for handing over the `oni` NPM package name.
