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

npm run build
npm run test:unit
npm run lint

# Increase the timeout from 10minutes -> 20minutes for packing the dmg
travis_wait npm run pack

echo Using neovim path: "$ONI_NEOVIM_PATH"

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
   npm run demo:screenshot
fi

npm run test:integration

# Upload master bits
npm run upload:dist

# We'll run code coverage only on Linux, for now
if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
    npm run ccov:instrument
    npm run ccov:test:browser
    npm run ccov:remap:browser:lcov
    npm run ccov:clean
    npm run ccov:upload
fi
