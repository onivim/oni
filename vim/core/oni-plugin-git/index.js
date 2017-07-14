const childProcess = require("child_process");
const path = require("path");
const Q = require("q");

const activate = (Oni) => {

    const getGitBranch = (options) => {
        const deferred = Q.defer();
        childProcess.exec("git rev-parse --abbrev-ref HEAD", options, (error, stdout, stderr) => {
            if (error && error.code) {
                deferred.reject(new Error(stderr));
            } else {
                deferred.resolve(stdout);
            }
        });
        return deferred.promise;
    };

    const gitBranchIndicator = Oni.statusBar.createItem(0, -3);

    const updateBranchIndicator = (evt) => {
        getGitBranch({ cwd: path.dirname(evt.bufferFullPath) })
        .then((branchName) => {
            const React = Oni.dependencies.React;
            const branchIcon = Oni.ui.createIcon({ name: "code-fork", size: Oni.ui.IconSize.Large });
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
