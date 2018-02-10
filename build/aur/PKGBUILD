# Maintainer: Amadeus Folego <amadeusfolego@gmail.com>
# Maintainer: Terje Larsen <terlar@gmail.com>
pkgname=oni
pkgver=0.2.21
pkgrel=1
pkgdesc='An IDE built around Neovim'
arch=(x86_64)
url="https://github.com/onivim/oni"
license=('MIT')
depends=('neovim' 'nodejs' 'gconf' 'libxss')
makedepends=('tar')
source=("https://github.com/onivim/${pkgname}/releases/download/v${pkgver}/Oni-${pkgver}-x64-linux.tar.gz"
        "oni.sh"
        "oni.desktop"
        "icons.tar.gz")

sha256sums=('ede7c765a76716d500b7eb9a401b631aadb83a23227526108201f4b43ad9c9a3'
            '72a945d501f33cfc2fd0d8e832942ba75c09518abd2248973c4df461c3229aee'
            '72420b6c8588df601b973b715fc88f3d9e4d75ce53b633abff8c7ff848aed59a'
            '9b09686c82ac5670ece59608288ab2124ee3147d404b77ac58c6ba332a6a148a')

package() {
  install -d ${pkgdir}/opt/${pkgname}
  cp -R ${srcdir}/Oni-${pkgver}-x64-linux/* ${pkgdir}/opt/${pkgname}
  install -Dm755 $srcdir/${pkgname}.sh ${pkgdir}/usr/bin/${pkgname}

  install -Dm644 oni.desktop "$pkgdir/usr/share/applications/oni.desktop"

  tar -xf ${srcdir}/icons.tar.gz
  for i in 16x16 32x32 64x64 128x128 256x256 512x512 1024x1024; do
    install -Dm644 ${srcdir}/icons/$i.png "${pkgdir}/usr/share/icons/hicolor/$i/apps/oni.png"
  done
}
# vim:set ts=2 sw=2 et:
