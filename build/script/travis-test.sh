#!/usr/bin/env bash

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  # Initialize display driver
  # This is needed for our unit tests (electron-mocha)
  # and integration tests
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


echo Using neovim path: "$ONI_NEOVIM_PATH"

if [[ "$TRAVIS_OS_NAME" == "osx" && "$TRAVIS_PULL_REQUEST" != "false" ]]; then
   npm run demo:screenshot
fi

npm run test:unit
npm run test:integration

# Upload master bits
npm run upload:dist

# We'll run code coverage only on Linux, for now
if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
    npm run build:test:unit

    ls -a lib_test/browser/src

    npm run ccov:instrument

    ls -a lib_test/browser/src_ccov

    npm run ccov:test:browser
    npm run ccov:remap:browser:lcov
    npm run ccov:clean
    npm run ccov:upload
fi
