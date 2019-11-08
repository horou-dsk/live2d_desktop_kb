// Modules to control application life and create native browser window
const {app, BrowserWindow, screen, Tray, Menu} = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // width: 240,
    // height: 360,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'ico/dango.ico'),
    frame: false,
    transparent: true,
    useContentSize: true,
    skipTaskbar: true
    // fullscreen: true
  })

  // mainWindow.setIgnoreMouseEvents(true)

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  /*setInterval(() => {
    console.log(mainWindow.getPosition())
    console.log(mainWindow.getSize())
  }, 2000)*/

  mainWindow.webContents.openDevTools()
  /*setInterval(() => {
    let mousePos = screen.getCursorScreenPoint();
    console.log(mousePos);
  }, 5000)*/

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  tray = new Tray(path.join(__dirname, 'ico/dango.ico'))
  tray.setToolTip('团子')
  let onTopFlag = false, ignoreMouseEvent = false
  function setContextMenu() {
    tray.setContextMenu(Menu.buildFromTemplate([
      {label: onTopFlag ? '取消置顶' : '置顶显示', click: () => {
          mainWindow.setAlwaysOnTop(!onTopFlag)
          onTopFlag = !onTopFlag
          setContextMenu()
        }},
      {label: ignoreMouseEvent ? '取消穿透' : '鼠标穿透', click: () => {
          ignoreMouseEvent = !ignoreMouseEvent
          mainWindow.setIgnoreMouseEvents(ignoreMouseEvent)
          setContextMenu()
        }},
      {label: '退出', click: () => app.quit()}
    ]))
  }
  setContextMenu()
  tray.on('click', () => {
    mainWindow.show()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
