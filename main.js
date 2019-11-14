// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray, Menu} = require('electron')
const path = require('path')
const fs = require('fs')
const iohook = require('iohook')
const __DEV__ = require('./openv')
let config = require('./config')
const docPath = path.join(app.getPath('documents'), '/Live2dDesktopKB')
const configPath = path.join(docPath, '/config.json')
const live2dModelPath = path.join(docPath, '/live2d_models')


function resolvePath(path) {
  return __DEV__ ? path : '.' + path
}

function live2dModels(dir) {
  const list = []
  const t = (p) => {
    const dirList = fs.readdirSync(p)
    dirList.forEach(value => {
      const rpath = p + '/' + value
      const abspath = path.join(p, value)
      const stat = fs.statSync(abspath)
      if(stat.isFile() && /model\.json/.test(abspath)) {
        list.push(rpath)
      } else if (stat.isDirectory()) {
        t(rpath)
      }
    })
  }
  t(dir)
  return list
}

function asyncConfig() {
  if(__DEV__) return
  fs.writeFileSync(configPath, JSON.stringify(config))
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray

function createWindow () {
  const {powerMonitor} = require('electron')
  if(!fs.existsSync(docPath)) fs.mkdirSync(docPath)
  if(!fs.existsSync(live2dModelPath)) fs.mkdirSync(live2dModelPath)
  if(!__DEV__ && fs.existsSync(configPath)) {
    config = Object.assign(config, JSON.parse(fs.readFileSync(configPath).toString()))
  }
  // config = new Proxy(config, {set: () => asyncConfig()})

  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: config.screenWidth,
    height: config.screenHeight,
    x: config.screenX,
    y: config.screenY,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'ico/dango.ico'),
    frame: false,
    resizable: false,
    transparent: true,
    // useContentSize: true,
    skipTaskbar: true,
    alwaysOnTop: config.alwaysOnTop
    // fullscreen: true
  })

  mainWindow.setIgnoreMouseEvents(config.ignoreMouse)

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    asyncConfig()
    iohook.stop()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('changeModel', config.model ? config.model : resolvePath('./live2d_models/live2d-widget-model-tsumiki/assets/tsumiki.model.json'))
  })

  mainWindow.on('move', () => {
    const [x, y] = mainWindow.getPosition()
    config.screenX = x
    config.screenY = y
  })

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize()
    config.screenWidth = width
    config.screenHeight = height
  })

  iohook.on('mousedown', (event) => {
    const [x, y] = mainWindow.getPosition()
    mainWindow.webContents.sendInputEvent({type: 'mouseDown', x: event.x - x, y: event.y - y})
  })

  if(config.clickTrigger) iohook.start()

  // windows 注销/关机 钩子事件
  mainWindow.hookWindowMessage(22, () => {
    asyncConfig()
  })

  powerMonitor.on('shutdown', () => {
    asyncConfig()
  })

  const list = live2dModels(path.join(__dirname, __DEV__ ? './live2d_models' : '../live2d_models')).concat(live2dModels(live2dModelPath))
  tray = new Tray(path.join(__dirname, 'ico/dango.ico'))
  tray.setToolTip('団子')
  let onTopFlag = config.alwaysOnTop, ignoreMouseEvent = config.ignoreMouse, resizable = false
  function setContextMenu() {
    tray.setContextMenu(Menu.buildFromTemplate([
      {label: onTopFlag ? '取消置顶' : '置顶显示', click: () => {
          mainWindow.setAlwaysOnTop(!onTopFlag)
          onTopFlag = !onTopFlag
          config.alwaysOnTop = onTopFlag
          setContextMenu()
        }},
      {label: ignoreMouseEvent ? '取消穿透' : '鼠标穿透', click: () => {
          ignoreMouseEvent = !ignoreMouseEvent
          mainWindow.setIgnoreMouseEvents(ignoreMouseEvent)
          config.ignoreMouse = ignoreMouseEvent
          setContextMenu()
        }},
      {label: config.clickTrigger ? '关闭鼠标事件捕获' : '开启鼠标事件捕获', click: () => {
          config.clickTrigger = !config.clickTrigger
          config.clickTrigger ? iohook.start() : iohook.stop()
          setContextMenu()
        }},
      {label: !resizable ? '调整窗口大小' : '关闭调整', click: () => {
          mainWindow.setResizable(resizable = !resizable)
          mainWindow.webContents.send('resizable', resizable)
          setContextMenu()
        }},
      {label: '模型列表', type: 'submenu', submenu: Menu.buildFromTemplate(list.map(v => ({
          label: v.match(/[^\\\/]*model\.json$/)[0],
          click: () => {
            mainWindow.webContents.send('changeModel', v)
            config.model = v
          }
        })))},
      {label: '退出', click: () => app.quit()},
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
