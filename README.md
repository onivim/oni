![alt text](./assets/oni-header.png)

### IDE powered by Neovim + React + Electron

[![Build Status](https://travis-ci.org/onivim/oni.svg?branch=master)](https://travis-ci.org/onivim/oni) [![Build Status](https://ci.appveyor.com/api/projects/status/gum9hty9hm65o7ae/branch/master?svg=true)](https://ci.appveyor.com/project/onivim/oni/branch/master)
[![Join the chat at https://gitter.im/onivim/Lobby](https://badges.gitter.im/onivim/Lobby.svg)](https://gitter.im/onivim/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Backers on Open Collective](https://opencollective.com/oni/backers/badge.svg)](https://opencollective.com/oni#backer) [![Sponsors on Open Collective](https://opencollective.com/oni/sponsors/badge.svg)](https://opencollective.com/oni#sponsor) [![BountySource Active Bounties](https://api.bountysource.com/badge/tracker?tracker_id=48462304)](https://www.bountysource.com/teams/oni)
[![Total Downloads](https://img.shields.io/github/downloads/onivim/oni/total.svg)](https://github.com/onivim/oni/releases)

<h2 align="center">Supporting Oni</h2>

Oni is an MIT-licensed open source project. Please consider supporting Oni by:
- [Become a backer or sponsor on Open Collective](https://opencollective.com/oni)
- [Become a backer on BountySource](https://www.bountysource.com/teams/oni)


<h3 align="center">Sponsors via OpenCollective</h3>

Support this project by [becoming a sponsor](https://opencollective.com/oni#sponsor). Your logo will show up here with a link to your website.

<a href="https://opencollective.com/oni/sponsor/0/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/1/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/2/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/3/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/4/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/5/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/6/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/7/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/8/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/oni/sponsor/9/website" target="_blank"><img src="https://opencollective.com/oni/sponsor/9/avatar.svg"></a>

## Introduction

Oni is a [neovim](https://github.com/neovim/neovim) front-end UI with rich IDE-like UI integration points, drawing inspiration from [VSCode](https://github.com/Microsoft/vscode), [Atom](https://atom.io/), and [LightTable](http://lighttable.com/).

<p align="center">
    <img src="https://s3-us-west-2.amazonaws.com/oni-media/screenshot-darwin.png"/>
</p>

This repository is under __active development__, and until 1.0 please consider everything unstable.

Check out [Releases](https://github.com/onivim/oni/releases) for the latest binaries, or [Build Oni](https://github.com/onivim/oni/wiki/Development) from source. Consider making a donation via [BountySource](https://salt.bountysource.com/teams/oni) if you find this project useful!

## Features

Oni brings several IDE-like integrations to neovim:

- [Quick Info](https://github.com/onivim/oni/wiki/Features#quick-info)
- [Code Completion](https://github.com/onivim/oni/wiki/Features#code-completion)
- [Syntax / Compilation Errors](https://github.com/onivim/oni/wiki/Features#syntax--compilation-errors)
- [Fuzzy Finding](https://github.com/onivim/oni/wiki/Features#fuzzy-finder)
- [Status Bar](https://github.com/onivim/oni/wiki/Features#status-bar)

Oni is cross-platform and supports Windows, OS X, and Linux.

## Installation

 - Check out [Releases](https://github.com/onivim/oni/releases) for the latest binary.
 - If you'd prefer to build from source, see [Development](https://github.com/onivim/oni/wiki/Development)

> NOTE: Windows & OSX releases come with a bundled neovim release, so you do not need a neovim install on those platforms.

### Windows

- Download the [Oni installer](https://github.com/onivim/oni/releases/download/v0.2.19/Oni-0.2.19-ia32-win.exe) for Windows
- Once it is downloaded, run the installer. This will only take a minute.
- By default, Oni is installed under `C:\Program Files (x86)\Oni` for a 64-bit machine.

You can also find install via a [zip archive](https://github.com/onivim/oni/releases/download/v0.2.19/Oni-0.2.19-ia32-win.zip)

> You may want to add Oni to your `%PATH%`, so that from the console, you can open Oni via `oni`

### Mac

- Download [Oni](https://github.com/onivim/oni/releases/download/v0.2.19/Oni-0.2.19-osx.dmg) for Mac
- Double-click on the archive to expand
- Drag `Oni.app` to the `Applications` folder

To enable key repeat when pressing & holding a key in Oni, write the following in your terminal:

```sh
defaults write com.extropy.oni ApplePressAndHoldEnabled -bool false
```

> You can invoke `oni` from your terminal after adding it to your PATH, though CMD-Shift-P > Add to Path

### Linux

#### Debian and Ubuntu based distributions

> If you do not have Neovim, follow the instructions to [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available. Version `0.2.1` is required..

- Download the [.deb package (64-bit)](https://github.com/onivim/oni/releases/download/v0.2.19/Oni-0.2.19-amd64-linux.deb)
- Install the package with `sudo dpkg -i <file>.deb`

A [tar.gz](https://github.com/onivim/oni/releases/download/v0.2.19/Oni-0.2.19-linux.tar.gz) is also available.

#### Red Hat based distributions (Fedora, CentOS)

> If you do not have Neovim, follow the instructions to [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available. Version `0.2.1` is required..

- Download the [.rpm package](https://github.com/onivim/oni/releases/download/v0.2.19/Oni-0.2.19-x86_64-linux.rpm)
- Install the package with `sudo dnf install <file>.rpm`

A [tar.gz](https://github.com/onivim/oni/releases/download/v0.2.19/Oni-0.2.19-linux.tar.gz) is also available.

#### Arch based distributions

- Available via the [AUR](https://aur.archlinux.org/packages/oni/)
- Install the package with `yaourt -S oni`

A [tar.gz](https://github.com/onivim/oni/releases/download/v0.2.19/Oni-0.2.19-linux.tar.gz) is also available.

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

The goal of this project is to give an editor that gives the best of both worlds - the power, speed, and flexibility of using Vim for manipulating text, as well as the rich tooling that comes with an IDE.

## Documentation

- Check out the [Wiki](https://github.com/onivim/oni/wiki) for documentation on how to use and modify Oni.
- [FAQ](https://github.com/onivim/oni/wiki)
- [Roadmap](https://github.com/onivim/oni/wiki/Roadmap)

## Contributing

There many ways to contribute to Oni:

- Support Oni financially by making a donation via [Bountysource](https://salt.bountysource.com/teams/oni)
- [Submit bugs](https://github.com/onivim/oni/issues) or propose new features.
- Review and upate our [documentation](https://github.com/onivim/oni/wiki)
- Try out the latest [released build](https://github.com/onivim/oni/releases)
- Contribute a bug fix or code change - start by checking our [Development Page](https://github.com/onivim/oni/wiki/Development)

## Acknowledgements

Oni is an independent project and is made possible by the support of some exceptional people. Big thanks to the following people for helping to realize this project:

- the [neovim team](https://neovim.io/), especially [justinmk](https://github.com/justinmk) and [tarruda](https://github.com/tarruda) - Oni would not be possible without their vision
- [jordwalke](https://github.com/jordwalke) for his generous support, inspiration, and ideas. And React ;)
- [keforbes](https://github.com/keforbes) for helping to get this project off the ground
- [tillarnold](https://github.com/tillarnold) for giving us the `oni` npm package name
- [mhartington](https://github.com/mhartington) for his generous support
- [badosu](https://github.com/badosu) for his support, contributions, and managing the AUR releases
- All our current monthly [sponsors](https://salt.bountysource.com/teams/oni/supporters) and [backers](BACKERS.md)
- All of our [contributors](https://github.com/onivim/oni/graphs/contributors) - thanks for helping to improve this project!

Several other great neovim front-end UIs [here](https://github.com/neovim/neovim/wiki/Related-projects) served as a reference, especially [NyaoVim](https://github.com/rhysd/NyaoVim) and [VimR](https://github.com/qvacua/vimr). I encourage you to check those out!

Thank you!

## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="https://github.com/onivim/oni/graphs/contributors"><img src="https://opencollective.com/oni/contributors.svg?width=890" /></a>

## License

MIT License. Copyright (c) Bryan Phelps

Windows and OSX have a bundled version of Neovim, which is covered under [Neovim's license](https://github.com/neovim/neovim/blob/master/LICENSE)

### Bundled Plugins

Bundled plugins have their own license terms. These include:
- [typescript-vim](https://github.com/leafgarland/typescript-vim) (`oni/vim/core/typescript.vim`)
- [targets.vim](https://github.com/wellle/targets.vim) (`oni/vim/default/bundle/targets.vim`)
- [vim-commentary](https://github.com/tpope/vim-commentary) (`oni/vim/default/bundle/vim-commentary`)
- [vim-unimpaired](https://github.com/tpope/vim-unimpaired) (`oni/vim/default/bundle/vim-unimpaired`)
- [vim-reasonml](https://github.com/reasonml-editor/vim-reason) (`.vim` files in `oni/vim/core/oni-plugin-reasonml`)

