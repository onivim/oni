const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const Q = require("q");

const activate = (Oni) => {

    const gitBranchIndicator = Oni.statusBar.createItem(0, -3);

    const pathIsDir = (p) => {
        const deferred = Q.defer();
        fs.stat(p, (error, stats) => {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve(stats.isDirectory());
            }
        });
        return deferred.promise;
    };

    const updateBranchIndicator = (evt) => {
        pathIsDir(evt.bufferFullPath)
        .then((isDir) => {
            dir = null;
            if (isDir) {
                dir = evt.bufferFullPath;
            } else {
                dir = path.dirname(evt.bufferFullPath);
            }
            return Oni.services.git.getBranch(dir);
        })
        .then((branchName) => {
            const React = Oni.dependencies.React;
            const branchIcon = Oni.ui.createIcon({ name: "code-fork", size: Oni.ui.iconSize.Large });
            const gitBranch  = React.createElement("div", null, branchIcon, " " + branchName);
            gitBranchIndicator.setContents(gitBranch);
            gitBranchIndicator.show();
        })
        .fail((error) => {
            gitBranchIndicator.hide();
        })
        .done();
    };

    Oni.on("buffer-enter", updateBranchIndicator);
};

module.exports = {
    activate,
};
