#!/usr/bin/env bash

echo Travis build - detected OS is: $TRAVIS_OS_NAME
set -e

node --version
npm --version

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3

  # Install Neovim
  curl -LO https://github.com/neovim/neovim/releases/download/v0.2.2/nvim.appimage
  chmod u+x nvim.appimage
  ./nvim.appimage --version
  export ONI_NEOVIM_PATH="$(cd "$(dirname "$1")"; pwd)/nvim.appimage"
fi

npm run build
npm run test:unit
npm run lint
npm run pack

echo Using neovim path: $ONI_NEOVIM_PATH

npm run test:integration

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
   npm run demo
fi

# We'll run code coverage only on Linux, for now
if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
    npm run ccov:instrument
    npm run ccov:test:browser
    npm run ccov:report:lcov-debug
    npm run ccov:report

    ls -a .nyc_output
    ls -a .nyc_output/coverage
fi

npm run copy-dist-to-s3
