#!/bin/bash

if [ "$(uname)" == 'Darwin' ]; then
    OS='Mac'
else
    # TODO: Support Linux
    echo "Your platform ($(uname -a)) is not supported."
    exit 1
fi

ONI_CWD="$PWD"

ONI_PATH="`dirname \"$0\"`" # Relative directory
ONI_PATH="`( cd \"$ONI_PATH\" && pwd )`" # Absolute directory

FULL_ONI_PATH="$ONI_PATH/../../MacOS/Oni"

open -a "$FULL_ONI_PATH" --args $*
