import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { WindowStateManager } from './WindowStateManager'
import { RabbitConnection } from './rabbit'
import appConfig from 'electron-settings'

const windowStateManager = new WindowStateManager('main')

let rabbitConnection: RabbitConnection | null = null

function createWindow(): void {
  const windowState = windowStateManager.getState()
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  windowStateManager.track(mainWindow)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Save all of the details for the connection
  mainWindow.on('close', () => {
    if (rabbitConnection) {
      appConfig.setSync(`rabbitConnection.${rabbitConnection.getConnection().id}`, rabbitConnection.getState())
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle('connection-save', (_, connection) => {
  appConfig.setSync(`connection.${connection.id}`, connection)
})

ipcMain.handle('connection-list', () => {
  return appConfig.getSync('connection') || {}
})

ipcMain.handle('connection-delete', (_, id) => {
  appConfig.unsetSync(`connection.${id}`)
})

ipcMain.handle('rabbit-connect', async (_, options) => {
  rabbitConnection = new RabbitConnection(options)
  await rabbitConnection.connect()

  if (appConfig.hasSync(`rabbitConnection.${rabbitConnection.getConnection().id}`)) {
    const state: any = appConfig.getSync(`rabbitConnection.${rabbitConnection.getConnection().id}`)
    return await rabbitConnection.loadState(state)
  }

  return rabbitConnection.getState()
})

ipcMain.handle('rabbit-disconnect', async () => {
  if (!rabbitConnection) {
    throw new Error('Not connected to RabbitMQ')
  }

  await rabbitConnection.disconnect()
  appConfig.setSync(`rabbitConnection.${rabbitConnection.getConnection().id}`, rabbitConnection.getState())
  rabbitConnection = null
})

ipcMain.handle('rabbit-list-exchanges', async (_) => {
  if (!rabbitConnection) {
    throw new Error('Not connected to RabbitMQ')
  }

  return await rabbitConnection.listExchanges()
})

ipcMain.handle('rabbit-add-queue', async (_, { name, exchange, bindOptions }) => {
  if (!rabbitConnection) {
    throw new Error('Not connected to RabbitMQ')
  }

  return await rabbitConnection.createQueue({ name, exchange, bindOptions })
})

ipcMain.handle('rabbit-delete-queue', async (_, queue) => {
  if (!rabbitConnection) {
    throw new Error('Not connected to RabbitMQ')
  }

  return await rabbitConnection.deleteQueue(queue)
})

ipcMain.handle('rabbit-exchange-hide', async (_, exchange) => {
  if (!rabbitConnection) {
    throw new Error('Not connected to RabbitMQ')
  }

  return rabbitConnection.hideExchange(exchange)
})

ipcMain.handle('rabbit-exchange-unhide', async (_, exchange) => {
  if (!rabbitConnection) {
    throw new Error('Not connected to RabbitMQ')
  }

  return rabbitConnection.unhideExchange(exchange)
})
