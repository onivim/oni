#!/bin/bash

# Get the path to the currently running script:
self=$0

# Test if $self is a symlink
if [ -L "$self" ] ; then
   # readlink returns the path to the file the link points to:
   target=$(readlink "$self")
else
   target=$self
fi

ONI_PATH=$(dirname "$target")
ONI_EXECUTABLE="${ONI_PATH}/../../../../MacOS/Oni"
CLI_SCRIPT="${ONI_PATH}/../../lib/cli/src/cli.js"

ELECTRON_RUN_AS_NODE=1 "${ONI_EXECUTABLE}" "$CLI_SCRIPT" "$*"
exit $?