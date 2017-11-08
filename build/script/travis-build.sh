#!/usr/bin/env bash

echo Travis build - detected OS is: $TRAVIS_OS_NAME

node --version
npm --version

npm run build
npm run test:unit
npm run lint
npm run pack

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
    npm run test:integration
fi
