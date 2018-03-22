#!/usr/bin/env bash

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

node --version
npm --version

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  DISPLAY=:99.0
  export DISPLAY
  sh -e /etc/init.d/xvfb start
  sleep 3

  # Install Neovim
  curl -LO https://github.com/neovim/neovim/releases/download/v0.2.2/nvim.appimage
  chmod u+x nvim.appimage
  ./nvim.appimage --version
  ONI_NEOVIM_PATH="$(cd "$(dirname "$1")"; pwd)/nvim.appimage"
  export ONI_NEOVIM_PATH
fi

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
    # Set debug flag for electron-builder, 
    # to troubleshoot intermittent failures with building the dmg
    DEBUG=electron-builder,electron-builder:*
    export DEBUG
fi

npm run build
npm run test:unit
npm run lint
