[![Build Status](https://travis-ci.org/extr0py/oni.svg?branch=master)](https://travis-ci.org/extr0py/oni)
[![Build Status](https://ci.appveyor.com/api/projects/status/gum9hty9hm65o7ae/branch/master?svg=true)](https://ci.appveyor.com/project/extr0py/oni/branch/master)
[![Join the chat at https://gitter.im/extr0py/Lobby](https://badges.gitter.im/extr0py/Lobby.svg)](https://gitter.im/extr0py/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![BountySource Active Bounties](https://api.bountysource.com/badge/tracker?tracker_id=48462304)](https://www.bountysource.com/teams/oni)
# Oni
![alt text](./images/Oni_128.png)
## Neovim + JavaScript powered IDE

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
    - [Windows](#windows)
    - [Mac](#mac)
    - [Linux](#linux)
    - [Build](#build)
- [Documentation](#documentation)
    - [Usage](#usage)
        - [Code Completion](#code-completion)
        - [Fuzzy Finder](#fuzzy-finder)
        - [Quick Info](#quick-info)
        - [Status Bar](#status-bar)
    - [Languages](#languages)
        - [JavaScript and TypeScript](#javascript-and-typescript)
        - [C#](#c)
        - [Go](#go)
        - [Python](#python)
        - [Reason and OCaml](#reason-and-ocaml)
    - [Configuration](#configuration)
    - [Extensibility](#extensibility)
    - [FAQ](#faq)
- [Roadmap](#roadmap)
- [License](#license)
- [Contributing](#contributing)
- [Thanks](#thanks)
    - [Sponsors](#sponsors)

## Introduction

ONI is a [NeoVim](https://github.com/neovim/neovim) front-end UI with rich IDE-like UI integration points, drawing inspiration from [VSCode](https://github.com/Microsoft/vscode), [Atom](https://atom.io/), and [LightTable](http://lighttable.com/)

![screenshot](http://i.imgur.com/qAFSg7y.jpg)

This repository is under __active development__, and until 1.0 please consider everything unstable.

Check out [Releases](https://github.com/extr0py/oni/releases) for the latest binaries, or [Build Oni](#build) from source.

## Features

ONI brings several IDE-like integrations to NeoVim:

- **[Quick Info](#quick-info)**

![quick-info-demo](http://i.imgur.com/0vJ8KgU.gif)

- **[Code Completion](#code-completion)**

![completion-demo](http://i.imgur.com/exdasXs.gif)

- **Syntax / Compilation Errors**

![syntax-error-demo](http://i.imgur.com/GUBhRhG.gif)

- **[Fuzzy Finding](#fuzzy-finder)**

![fuzzy-finder-demo](http://i.imgur.com/wYnvcT6.gif)

- **Live Evaluation**

![live-eval-demo](http://i.imgur.com/XenTrdC.gif)

- **Status Bar**

![status-bar-demo](http://i.imgur.com/2grzeN1.gif)

## Installation

Check out [Releases](https://github.com/extr0py/oni/releases) for the latest binary.

Windows & OSX releases come with a bundled Neovim release.

### Windows

- Download the [Oni installer](https://github.com/extr0py/oni/releases/download/v0.2.7/Oni-0.2.7-ia32-win.exe) for Windows
- Once it is downloaded, run the installer. This will only take a minute.
- By default, Oni is installed under `C:\Program Files (x86)\Oni` for a 64-bit machine. 

You can also find install via a [zip archive](https://github.com/extr0py/oni/releases/download/v0.2.7/Oni-0.2.7-ia32-win.zip)

> You may want to add Oni to your `%PATH%`, so that from the console, you can open Oni via `oni`

### Mac

- Download [Oni](https://github.com/extr0py/oni/releases/download/v0.2.7/Oni-0.2.7-osx.dmg) for Mac
- Double-click on the archive to expand
- Drag `Oni.app` to the `Applications` folder

### Linux

#### Debian and Ubuntu based distributions

> If you do not have Neovim, follow the instructions to [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available. Version `0.2.0` is required..

- Download the [.deb package (64-bit)](https://github.com/extr0py/oni/releases/download/v0.2.7/oni_0.2.7_amd64.deb)
- Install the package with `sudo dpkg -i <file>.deb`

A [tar.gz](https://github.com/extr0py/oni/releases/download/v0.2.7/oni-0.2.7.tar.gz) is also available.

#### Red Hat based distributions (Fedora, CentOS)

> If you do not have Neovim, follow the instructions to [Install Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) and ensure the 'nvim' binary is available. Version `0.2.0` is required..

- Download the [.rpm package](https://github.com/extr0py/oni/releases/download/v0.2.7/oni-0.2.7.rpm)
- Install the package with `sudo dnf install <file>.rpm`

A [tar.gz](https://github.com/extr0py/oni/releases/download/v0.2.7/oni-0.2.7.tar.gz) is also available.

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

> Out of the box, the only supported languages for rich completion are JavaScript, TypeScript, and C#. JavaScript and TypeScript Language Service which requires either a tsconfig.json or a jsconfig.json at the root of the project. You can use an empty json file with `{}` to get the rich completion. C# uses the [omnisharp](https://github.com/OmniSharp/omnisharp-node-client) service for completion, and will work wherever there is a .csproj file.

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
- `<C-p>` - navigate to previous entry in the Fuzzy Finder menu
- `<Enter>` - select a Fuzzy Finder item
- `<Esc>` - close the Fuzzy Finder menu

By default, Fuzzy Finder uses `git ls-files` to get the available files in the directory, but if git is not present, it will fallback to a non-git strategy.

The Fuzzy Finder strategy can be configured by the `editor.quickOpen.execCommand`, and must be a shell command that returns a list of files, separated by newlines.

#### Command Palette

The Command Palette offers another command-line based interface to Oni. 

##### Entry point 
 - `<C-P>`

##### Commands
- `<C-n>` - navigate to next entry in the Command Palette menu
- `<C-p>` - navigate to previous entry in the Command Palette menu
- `<Enter>` - select a Command Palette item
- `<Esc>` - close the Command Palette menu

Currently, the Command Palette includes items from: 
  - a few commonly used menu items
  - NPM package.json `scripts`
  - Plugin commands
  - Launch parameters from the `.oni` folder

#### Quick Info

Quick Info gives a quick summary of an identifier when the cursor is held on it. JavaScript and TypeScript is supported out of the box.

##### Entry point

Leave the cursor hovering over an identifier.

##### Options

- `oni.quickInfo.enabled` - If set to `true`, the Quick Info feature is enabled. (Default: `true`)
- `oni.quickInfo.delay` - Delay in milliseconds for the Quick Info window to show. (Default: `500`)

#### Status Bar

Oni features a rich status bar, designed as a replacement for vim-powerline and vim-airline.

##### API

Oni provides a `StatusBar` API for adding new items to the status bar.

##### Options

- `oni.statusbar.enabled` - If set to `true`, the status bar feature is enabled. (Default: `true`)

> Users that are coming from Neovim and have highly customized status bars may want to set `oni.statusbar.enabled` to false, along with setting the `oni.loadInitVim` to `true` and `oni.useDefaultConfig` to `false`.

### Languages

#### JavaScript and TypeScript

_Configuration_

JavaScript and TypeScript support is enabled out-of-the-box using the [TypeScript Standalone Server](https://github.com/Microsoft/TypeScript/wiki/Standalone-Server-(tsserver)). No setup and configuration is necessary, however, you will get better results if you use a `tsconfig.json` or a `jsconfig.json` to structure your project.

_Supported Language features_

| Completion | Goto Definition | Formatting | Enhanced Syntax Highlighting | Quick Info | Signature Help | Live Evaluation | Debugging |
| --- | --- | --- | --- | --- | --- |--- | --- |
| Y | Y | Y | Y | Y | Y | Y | N |

#### C#

_Configuration_

C# completion uses the [OmniSharp Node Client](https://github.com/OmniSharp/omnisharp-node-client) which provides language capabilities for both .NET and Mono. For it to work correctly, you need to have a valid `.csproj` file with any dependent packages (ie, Nuget) installed. The project should also build and compile for the language service to work correctly.

> If you are using the .NET Core CLI, make sure to run `dotnet restore` on your project.

_Supported Language features_

| Completion | Goto Definition | Formatting | Enhanced Syntax Highlighting | Quick Info | Signature Help | Live Evaluation | Debugging |
| --- | --- | --- | --- | --- | --- |--- | --- |
| Y | Y | N | N | Y | N | N | N |

_Known Issues_

- On Windows, you must run Oni as an administrator the first time using the C# language service. This is tracked by issue [#423](https://github.com/extr0py/oni/issues/423).
- On all platforms, the C# language service takes time to start up, especially the first time as it is downloading the appropriate runtime environment. You can open up the developer tools (Help -> Developer Tools) to see the logging from the language service. [#424](https://github.com/extr0py/oni/issues/424) tracks making this logging more visible.

#### Go

_Configuration_

Go language support depends on the [go-langserver](https://github.com/sourcegraph/go-langserver) by [SourceGraph](https://sourcegraph.com), which provides language support for Go. Follow their installation instructions as this language server is not bundled out-of-the-box with Oni.

> `go-langserver` must be available in your PATH. You can override this by setting the `golang.langServerCommand` configuration value.

_Supported Language features_

| Completion | Goto Definition | Formatting | Enhanced Syntax Highlighting | Quick Info | Signature Help | Live Evaluation | Debugging |
| --- | --- | --- | --- | --- | --- |--- | --- |
| N | Y | N | N | Y | N | N | N |

_Known Issues_

- There is no Windows support at the moment - this is being tracked by [sourcegraph/go-langserver#113](https://github.com/sourcegraph/go-langserver/issues/113).

#### Python

_Configuration_

Python language support depends on [pyls](https://github.com/palantir/python-language-server) by [Palantir](https://www.palantir.com/), which provides language support for Python. Follow their installation instructions as this language server is not bundled out-of-the-box with Oni.

> `pyls` must be available in your PATH. You can override this by setting the `python.langServerCommand` configuration value.

_Supported Language features_

| Completion | Goto Definition | Formatting | Enhanced Syntax Highlighting | Quick Info | Signature Help | Live Evaluation | Debugging |
| --- | --- | --- | --- | --- | --- |--- | --- |
| Y | Y | N | N | Y | N | N | N |

_Known Issues_

- Windows support is blocked by this issue: [palantir/python-language-server#53](https://github.com/palantir/python-language-server/issues/53).

#### Reason and OCaml

_Configuration_

Reason and OCaml support depends on [ocaml-language-server](https://github.com/freebroccolo/ocaml-language-server) by @freebroccolo.

You will need to build the language server locally, as the currently published NPM package is out-of-date:
1. Install [requirements](https://github.com/freebroccolo/ocaml-language-server#requirements)
2. `git clone https://github.com/freebroccolo/ocaml-language-server.git`
3. `cd ocaml-language-server`
4. `yarn install`
5. `yarn run compile`
6. `npm link`

> __NOTE:__ Once the NPM package is updated with a fix for [#22](https://github.com/freebroccolo/ocaml-language-server/issues/22), steps 2-6 can be replaced with `npm install -g ocaml-language-server`.

_Supported Language features_

| Completion | Goto Definition | Formatting | Enhanced Syntax Highlighting | Quick Info | Signature Help | Live Evaluation | Debugging |
| --- | --- | --- | --- | --- | --- |--- | --- |
| Y | Y | N | Y | Y | N | N | N |


### Configuration

> ONI is configurable via a 'config.js' located in $HOME/.oni

Here's an example config.js:
```
module.exports = {
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
- `oni.exclude` - Glob pattern of files to exclude from Fuzzy Finder (Ctrl-P).  Defaults to `["**/node_modules/**"]`
- `oni.hideMenu` - (default: `false`) If true, hide menu bar.  When hidden, menu bar can still be displayed with `Alt`.
- `editor.fontSize` - Font size
- `editor.fontFamily` - Font family
- `editor.fontLigatures` - (default: `true`). If true, ligatures are enabled.
- `editor.backgroundImageUrl` - specific a custom background image
- `editor.backgroundImageSize` - specific a custom background size (cover, contain)
- `editor.scrollBar.visible` - (default: `true`) sets whether the buffer scrollbar is visible
- `environment.additionalPaths` - (default: `[] on Windows, ['/usr/bin', '/usr/local/bin'] on OSX and Linux`). Sets additional paths for binaries. This may be necessary to configure, if using plugins or a Language Server that is not in the default set of runtime paths. Note that depending on where you launch Oni, there may be a different set of runtime paths sent to it - you can always check by opening the developer tools and running `process.env.PATH` in the console.

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

If you're interested in helping out, check out [CONTRIBUTING.md](./CONTRIBUTING.md) for tips and tricks for working with ONI.

## Thanks

Big thanks to the NeoVim team - without their work, this project would not be possible. The deep integration with VIM would not be possible without the incredible work that was done to enable the msgpack-RPC interface. Thanks!

### Sponsors

A big THANK YOU to our current monthly sponsors. Your contributions help keep this project alive!

- [Mike Hartington](https://github.com/mhartington)

### Other Contributions

In addition, there are several other great NeoVim front-end UIs [here](https://github.com/neovim/neovim/wiki/Related-projects) that served as great reference points and learning opportunities.

Also, thanks to our [contributors](https://github.com/extr0py/oni/graphs/contributors) for helping out!

Special thanks to [Till Arnold](https://github.com/tillarnold) for handing over the `oni` NPM package name.
