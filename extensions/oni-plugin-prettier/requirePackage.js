const path = require("path")
const resolve = require("resolve")
const readPkgUp = require("read-pkg-up")

// CREDIT: Shamelessly *borrowed* from prettier-vscode

/**
 * Recursively search for a package.json upwards containing given package
 * as a dependency or devDependency.
 * @param {string} fspath file system path to start searching from
 * @param {string} pkgName package's name to search for
 * @returns {string} resolved path to prettier
 */
function findPkg(fspath = process.cwd(), pkgName) {
    const res = readPkgUp.sync({ cwd: fspath, normalize: false })
    const { root } = path.parse(fspath)
    if (
        res.pkg &&
        ((res.pkg.dependencies && res.pkg.dependencies[pkgName]) ||
            (res.pkg.devDependencies && res.pkg.devDependencies[pkgName]))
    ) {
        return resolve.sync(pkgName, { basedir: res.path })
    } else if (res.path) {
        const parent = path.resolve(path.dirname(res.path), "..")
        if (parent !== root) {
            return findPkg(parent, pkgName)
        }
    }
    return
}

/**
 * Require package explicitely installed relative to given path.
 * Fallback to bundled one if no pacakge was found bottom up.
 * @param {string} fspath file system path starting point to resolve package
 * @param {string} pkgName package's name to require
 * @returns module
 */
function requireLocalPkg(fspath, pkgName, fallbackModule) {
    const modulePath = findPkg(fspath, pkgName)
    if (modulePath) {
        try {
            return require(modulePath)
        } catch (e) {
            console.warn(`Failed to load ${pkgName} from ${modulePath}. Using bundled`)
            return fallbackModule
        }
    }

    return require(pkgName)
}

module.exports = { requireLocalPkg }
