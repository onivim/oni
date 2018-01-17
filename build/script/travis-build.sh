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
   echo Installing reason CLI tools...
   npm install -g https://github.com/reasonml/reason-cli/archive/3.0.4-bin-darwin.tar.gz
   echo Reason CLI tools installed successfully.

   echo NVIM_DIR: $NVIM_DIR
   echo NODE_VERSION: $NODE_VERSION

   which ocamlmerlin
   ocamlmerlin -version
   PATH=$PATH:~/.nvm/versions/node/$NODE_VERSION/bin

   npm run test:integration
   npm run demo
fi

# We'll run code coverage only on Linux, for now
if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
    npm run ccov:instrument
    npm run ccov:test:browser
    npm run ccov:report
fi
