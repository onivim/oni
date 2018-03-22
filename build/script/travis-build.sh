#!/usr/bin/env bash

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

node --version
npm --version

npm run build
npm run test:unit
npm run lint
