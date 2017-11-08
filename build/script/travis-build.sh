#!/usr/bin/env bash

echo Travis build - detected OS is: $TRAVIS_OS_NAME

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3

  sudo apt-get --assume-yes install software-properties-common
  sudo apt-get --assume-yes install python-software-properties
  sudo add-apt-repository ppa:neovim-ppa/stable
  sudo apt-get update
  sudo apt-get --assume-yes install neovim

  nvim --version
fi

node --version
npm --version

npm run build
npm run test:unit
npm run lint
npm run pack

npm run test:integration
