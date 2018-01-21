// @ts-check
const activate = Oni => {
  const menu = Oni.menu.create();

  const updateBufferList = (Oni, menu) => {
    const buffers = Oni.editors.activeEditor.getBuffers();
    const bufferMenuItems = buffers.map(b => ({
      label: b.id,
      detail: b.filePath,
      icon: Oni.ui.getIconClassForFile(b.filePath),
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
      Oni.editors.activeEditor.openFile(menuItem.detail);
    }
  });

  Oni.editors.activeEditor.onBufferEnter.subscribe(() =>
    updateBufferList(Oni, menu)
  );
};

module.exports = { activate };
