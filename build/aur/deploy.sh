#!/bin/env bash
cd "$TRAVIS_BUILD_DIR/build/aur"

CURRENT_VERSION=$(node -e 'process.stdout.write(require("'"${TRAVIS_BUILD_DIR}"'/package.json").version)')

# Replace version in PKGBUILD with new version from package.json
sed -i '' -e "s,pkgver=[0-9].*$,pkgver=${CURRENT_VERSION}," PKGBUILD

# Obtain mksrcinfo
wget https://www.archlinux.org/packages/community/any/pkgbuild-introspection/download/ -O pkgbuild-introspection.tar.xz
tar -Jxf pkgbuild-introspection.tar.xz usr/bin/mksrcinfo
PATH="$PATH:$(pwd)/usr/bin"

git clone ssh://aur@aur.archlinux.org/oni.git aur
cp PKGBUILD
cd aur
mksrcinfo

git add PKGBUILD .SRCINFO
git config user.email "oni" # Hmmm
git config user.name "oni"  # Hmmm
git commit -m "Release $TRAVIS_TAG"

# Send to AUR
git push origin master
