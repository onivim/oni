#!/usr/bin/env bash

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

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
