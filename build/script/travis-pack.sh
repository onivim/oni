#!/usr/bin/env bash

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
    # Set debug flag for electron-builder, 
    # to troubleshoot intermittent failures with building the dmg
    DEBUG=electron-builder,electron-builder:*
    export DEBUG
fi

npm run pack
