const fs = require("fs");
const path = require("path");

const activate = (Oni) => {
    const gitBranchIndicator = Oni.statusBar.createItem(0, -3);

    const pathIsDir = (p) => {
        return new Promise((resolve, reject) => {
            fs.stat(p, (error, stats) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stats.isDirectory());
                }
            });
        })
    };

    const updateBranchIndicator = (evt) => {
        console.log('Update indicator ====================================: ', evt);
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
        .catch((error) => {
            gitBranchIndicator.hide();
        });
    };

    // Oni.on("buffer-enter", updateBranchIndicator);
    console.log(' updateBranchIndicator: ', updateBranchIndicator);
    console.log('Oni in [PLUGIN]!!!!!!!: ', Oni);
    console.log(' gitBranchIndicator: ', gitBranchIndicator);

    Oni.editors.allEditors.onBufferEnter.subscribe((evt) => {
        console.log('event: ', event);
        return updateBranchIndicator(evt);
    });
};

module.exports = {
    activate,
};
