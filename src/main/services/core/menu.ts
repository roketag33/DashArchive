import { app, Menu, shell, MenuItemConstructorOptions } from 'electron'

export function createMenu(): void {
  const isDev = !app.isPackaged
  const template: MenuItemConstructorOptions[] = [
    // { role: 'appMenu' }
    ...(isDev || process.platform === 'darwin'
      ? ([
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ] as MenuItemConstructorOptions[])
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [{ role: 'close' }] as MenuItemConstructorOptions[]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' }
      ] as MenuItemConstructorOptions[]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ] as MenuItemConstructorOptions[]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin'
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : ([{ role: 'close' }] as MenuItemConstructorOptions[]))
      ] as MenuItemConstructorOptions[]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async (): Promise<void> => {
            await shell.openExternal('https://electronjs.org')
          }
        },
        {
          label: 'Muted Logic Logs',
          click: async (): Promise<void> => {
            await shell.openExternal('file://' + app.getPath('userData') + '/logs')
          }
        }
      ] as MenuItemConstructorOptions[]
    }
  ]

  // Production specific: Remove DevTools/Reload from View menu if not dev
  if (!isDev) {
    const viewMenu = template.find((m) => m.label === 'View')
    if (viewMenu && viewMenu.submenu && Array.isArray(viewMenu.submenu)) {
      // Filter out dev tools and reload
      viewMenu.submenu = (viewMenu.submenu as MenuItemConstructorOptions[]).filter(
        (item) =>
          item.role !== 'toggleDevTools' && item.role !== 'reload' && item.role !== 'forceReload'
      )
    }
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
