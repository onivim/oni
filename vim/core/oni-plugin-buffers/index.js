// @ts-check
const path = require('path');

const activate = Oni => {
  const menu = Oni.menu.create();

  const truncateFilePath = filepath => {
    const sections = filepath.split(path.sep);
    const folderAndFiles = sections.slice(-2);
    return folderAndFiles.join(path.sep);
  };

  const updateBufferList = (Oni, menu) => {
    const buffers = Oni.editors.activeEditor.getBuffers();
    const active = Oni.editors.activeEditor.activeBuffer.filePath;

    const bufferMenuItems = buffers.map(b => ({
      label: `${active === b.filePath ? b.id + ' %' : b.id}`,
      detail: truncateFilePath(b.filePath),
      icon: Oni.ui.getIconClassForFile(b.filePath),
      pinned: active === b.filePath,
      metadata: {
        filepath: b.filepath,
        id: b.id,
      },
    }));

    return bufferMenuItems;
  };

  const createBufferList = () => {
    const buffers = updateBufferList(Oni, menu);
    menu.show();
    menu.setItems(buffers);
  };

  const toggleBufferList = () => {
    !menu.isOpen() ? createBufferList() : menu.hide();
  };

  const deleteBuffer = menu => {
    if (menu.selectedItem) {
      Oni.editors.activeEditor.bufferDelete(menu.selectedItem.metadata.id);
      menu.hide();
    }
  };

  const openBuffer = (menu, orientation) => {
    if (menu.selectedItem && menu.isOpen()) {
      const buffers = Oni.editors.activeEditor.getBuffers();
      const { filepath } = menu.selectedItem.metatadata;
      Oni.editors.activeEditor.openFile(filePath, orientation);
      menu.hide();
    }
    return;
  };

  Oni.commands.registerCommand({
    command: 'bufferlist.delete',
    name: 'Delete Selected Buffer',
    execute: () => deleteBuffer(menu),
  });

  Oni.commands.registerCommand({
    command: 'bufferlist.split',
    name: 'Split Selected Buffer',
    execute: () => openBuffer(menu, 'horizontal'),
  });

  Oni.commands.registerCommand({
    command: 'bufferlist.vsplit',
    name: 'Vertical Split Selected Buffer',
    execute: () => openBuffer(menu, 'vertical'),
  });

  Oni.commands.registerCommand({
    command: 'bufferlist.tabedit',
    name: 'Open Selected Buffer in a Tab',
    execute: () => openBuffer(menu, 'tab'),
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
    if (menuItem && menuItem.detail) {
      openBuffer(menu, 'edit');
    }
  });

  Oni.editors.activeEditor.onBufferEnter.subscribe(() =>
    updateBufferList(Oni, menu)
  );
};

module.exports = { activate };
