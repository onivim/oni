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
    export DEBUG=electron-builder,electron-builder:*
fi

npm run build
npm run test:unit
npm run lint
npm run pack

echo Using neovim path: "$ONI_NEOVIM_PATH"

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
   npm run demo:screenshot
fi

npm run test:integration


# We'll run code coverage only on Linux, for now
if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
    npm run ccov:instrument
    npm run ccov:test:browser
    npm run ccov:remap:browser:lcov
    npm run ccov:clean
    npm run ccov:upload
fi

npm run copy-dist-to-s3
