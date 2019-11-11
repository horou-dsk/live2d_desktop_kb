// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

function resolvePath(path) {
  return __DEV__ ? path : '.' + path
}

let model

window.onload = () => {
  if(typeof __DEV__ === 'undefined') window.__DEV__ = true
  console.log(__DEV__)
  const live2d_canvas = document.getElementById('live2d')
  const resize_box = document.getElementById('resize_box')

  if(!window.electron) return
  const {remote, dialog, ipcRenderer} = window.electron

  ipcRenderer.on('changeModel', (event, msg) => {
    model = msg
    loadlive2d("live2d", msg)
  })
  ipcRenderer.on('resizable', (event, bool) => {
    if(bool) {
      resize_box.style.display = 'block'
      live2d_canvas.className = 'live2dnd'
    }
    else {
      resize_box.style.display = 'none'
      live2d_canvas.className = 'live2d'
    }
  })
  let timer
  window.addEventListener('resize', () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      loadlive2d('live2d', model)
    }, 500)
  })
  let curMousePos = {}
  function dp() {
    const mousePos = remote.screen.getCursorScreenPoint()
    const winSize = remote.getCurrentWindow().getSize()
    if(winSize[0] !== live2d_canvas.width || live2d_canvas.height !== winSize[1]) {
      live2d_canvas.width = winSize[0]
      live2d_canvas.height = winSize[1]
    }
    if(mousePos.x !== curMousePos.x || mousePos.y !== curMousePos.y) {
      curMousePos = mousePos
      const winPos = remote.getCurrentWindow().getPosition()
      window.dispatchEvent(new MouseEvent('mousemove', {clientX: mousePos.x - winPos[0], clientY: mousePos.y - winPos[1]}))
    }
    requestAnimationFrame(dp)
  }
  dp()
}



/*setInterval(() => {
  console.log(win)
}, 5000)*/
