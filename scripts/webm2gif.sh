#!/bin/bash
# This script uses `ffmpeg` to convert a .webm file
# (specified by the first argument) to an animated gif

echo The argument is "$1" "$2"

ffmpeg -y -i "$1" -vf fps=10,scale=0:0:flags=lanczos,palettegen palette.png

ffmpeg -i "$1" -i palette.png -filter_complex "fps=10,scale=0:0:flags=lanczos[x];[x][1:v]paletteuse" output.gif
