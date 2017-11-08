#!/usr/bin/env bash

echo Travis build - detected OS is: $TRAVIS_OS_NAME

node --version
npm --version

npm run build
npm run test:unit
npm run lint
npm run pack

npm run test:integration
