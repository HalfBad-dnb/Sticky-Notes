const { app, BrowserWindow, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const http = require('http')

// Configure auto updater
autoUpdater.checkForUpdatesAndNotify()

// Check if Vite dev server is running
function checkDevServer() {
  return new Promise((resolve) => {
    const req = http.request('http://localhost:5173', (res) => {
      resolve(true)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(1000, () => resolve(false))
    req.end()
  })
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false
    }
  })

  // Always try dev server first, then fallback to built files
  try {
    const isDevServerRunning = await checkDevServer()
    
    if (isDevServerRunning) {
      console.log('Loading from dev server...')
      await mainWindow.loadURL('http://localhost:5173')
    } else {
      console.log('Loading from built files...')
      await mainWindow.loadFile('dist/index.html')
    }
  } catch (error) {
    console.error('Failed to load:', error)
    // Fallback to built files
    try {
      await mainWindow.loadFile('dist/index.html')
    } catch (fallbackError) {
      console.error('Failed to load built files:', fallbackError)
    }
  }

  // Prevent DevTools access via keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key === 'I') {
      event.preventDefault()
    }
    if (input.control && input.shift && input.key === 'C') {
      event.preventDefault()
    }
    if (input.control && input.shift && input.key === 'J') {
      event.preventDefault()
    }
    if (input.f12) {
      event.preventDefault()
    }
  })

  // Disable right-click context menu to prevent DevTools access
  mainWindow.webContents.on('context-menu', (event, params) => {
    event.preventDefault()
  })

  return mainWindow
}

// Auto updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info)
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info)
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
  console.log(log_message)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info)
  dialog.showMessageBox({
    type: 'info',
    title: 'Application Update',
    message: 'A new version has been downloaded. Restart the application to apply the updates.',
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})

app.whenReady().then(() => {
  const mainWindow = createWindow()
  
  // Check for updates on app start
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
