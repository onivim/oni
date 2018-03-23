#!/usr/bin/env bash

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

# Initialize display driver
# This is needed for our unit tests (electron-mocha)
# and integration tests
if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  DISPLAY=:99.0
  export DISPLAY
  sh -e /etc/init.d/xvfb start
  sleep 3
fi

node --version
npm --version

npm run build
npm run test:unit
npm run lint
