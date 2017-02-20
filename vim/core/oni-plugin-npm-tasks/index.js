const activate = (Oni) => {
    Oni.editor.executeShellCommand("npm run build")
}

module.exports = {
    activate
}
