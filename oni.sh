#!/bin/bash

if [ "$(uname)" == 'Darwin' ]; then
    OS='Mac'
else
    # TODO: Support Linux
    echo "Your platform ($(uname -a)) is not supported."
    exit 1
fi

# get the path to the currently running script:
self=$0

OPEN_DIRECTORY="$PWD"

# test if $self is a symlink
if [ -L "$self" ] ; then
   # readlink returns the path to the file the link points to:
   target=$(readlink "$self")
else
   target=$self
fi

ONI_PATH=$(dirname "$target")

FULL_ONI_PATH="$ONI_PATH/../../MacOS/Oni"

ONI_CWD="$OPEN_DIRECTORY" open --new -a "$FULL_ONI_PATH" --args $*
