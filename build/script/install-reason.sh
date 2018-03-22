#!/usr/bin/env bash

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
   echo Installing reason CLI tools...
   npm install -g reason-cli@3.1.0-darwin
   echo Reason CLI tools installed successfully.

   echo NVIM_DIR: $NVIM_DIR
   echo NODE_VERSION: $NODE_VERSION

   echo Checking ocamlmerlin....
   which ocamlmerlin
   ocamlmerlin -version

   PATH=$PATH:~/.nvm/versions/node/$NODE_VERSION/bin
fi
