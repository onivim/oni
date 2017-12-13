const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const fsStat = promisify(fs.stat);

const activate = Oni => {
  const React = Oni.dependencies.React;
  let isLoaded = false;
  try {

    const pathIsDir = async p => {
      try {
        const stats = await fsStat(p);
        return stats.isDirectory();
      } catch (error) {
        return error;
      }
    };

    const updateBranchIndicator = async evt => {
      const filePath = evt.bufferFullPath || evt.filePath;
      const gitBranchIndicator = Oni.statusBar.createItem(
        1,
        -3,
        'oni-plugin-git'
      );

      isLoaded = true;
      let dir;
      try {
        const isDir = await pathIsDir(filePath);
        const dir = isDir ? filePath : path.dirname(filePath);
        let branchName;
        try {
          branchName = await Oni.services.git.getBranch(dir);
        } catch (e) {
          gitBranchIndicator.hide();
          return;
          // return console.warn('[Oni.plugin.git]: No branch name found', e);
          // branchName = 'Not a Git Repo';
        }

        const props = {
          style: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        };

        const branchIcon = Oni.ui.createIcon({
          name: 'code-fork',
          size: Oni.ui.iconSize.Large,
        });
        const gitBranch = React.createElement(
          'div',
          props,
          branchIcon,
          ' ' + branchName
        );

        gitBranchIndicator.setContents(gitBranch);
        gitBranchIndicator.show();
      } catch (e) {
        console.log('[Oni.plugin.git]: ', e);
        return gitBranchIndicator.hide();
      }
    };

    if(!isLoaded) {
      updateBranchIndicator(Oni.editors.activeEditor.activeBuffer);
    }

    Oni.editors.activeEditor.onBufferEnter.subscribe(
      async evt => await updateBranchIndicator(evt)
    );
  } catch (e) {
    console.warn('[Oni.plugin.git] ERROR', e);
  }
};

module.exports = {
  activate,
};
