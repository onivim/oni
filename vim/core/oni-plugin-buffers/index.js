// @ts-check
const path = require('path');

const activate = Oni => {
  const menu = Oni.menu.create();

  const truncateFilePath = (filepath) => {
    const sections = filepath.split(path.sep);
    const folderAndFiles = sections.slice(- 2);
    return folderAndFiles.join(path.sep);
  };

  const updateBufferList = (Oni, menu) => {
    const buffers = Oni.editors.activeEditor.getBuffers();
    const active = Oni.editors.activeEditor.activeBuffer.filePath;
    const bufferMenuItems = buffers.map(b => ({
      label: `${active === b.filePath ? b.id + ' %': b.id}`,
      detail: truncateFilePath(b.filePath),
      icon: Oni.ui.getIconClassForFile(b.filePath),
      pinned: active === b.filePath,
    }));

    return bufferMenuItems;
  };

  const createBufferList = () => {
    const buffers = updateBufferList(Oni, menu);
    menu.show();
    menu.setItems(buffers);
    menu.setLoading(false);
  };

  const toggleBufferList = () => {
    !menu.isOpen() ? createBufferList() : menu.hide();
  };

  const deleteBuffer = menu => {
    if (menu.selectedItem) {
      //TODO: Command to execute buffer delete by Neovim
      // menu.onItemSelected(
      //   menu.selectedItem.label,
      //   `bd! ${menu.selectedItem.label}`
      // );
    }
  };

  Oni.commands.registerCommand({
    command: 'bufferlist.delete',
    name: 'Delete Selected Buffer',
    execute: () =>  deleteBuffer(menu),
  });

  Oni.commands.registerCommand({
    command: 'bufferlist.open',
    name: 'Open Bufferlist ',
    detail: 'Open A List of All Available Buffers',
    execute: createBufferList,
  });

  Oni.commands.registerCommand({
    command: 'bufferlist.toggle',
    name: 'Toggle Bufferlist ',
    detail: 'Toggle A List of All Available Buffers',
    execute: toggleBufferList,
  });

  menu.onItemSelected.subscribe(menuItem => {
    if (menuItem.detail) {
      const buffers = Oni.editors.activeEditor.getBuffers();
      const selectedBuffer = buffers.find(b => b.filePath.includes(menuItem.detail));
      Oni.editors.activeEditor.openFile(selectedBuffer.filePath);
    }
  });

  Oni.editors.activeEditor.onBufferEnter.subscribe(() =>
    updateBufferList(Oni, menu)
  );
};

module.exports = { activate };
