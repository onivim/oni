#!/usr/bin/env bash

echo Travis build - detected OS is: $TRAVIS_OS_NAME
set -e

node --version
npm --version

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
fi

npm run build
npm run test:unit
npm run lint
npm run pack

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
   npm run test:integration
   npm run demo
fi
