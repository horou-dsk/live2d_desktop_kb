// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

function resolvePath(path) {
  return __DEV__ ? path : '.' + path
}

window.onload = () => {
  if(typeof __DEV__ === 'undefined') window.__DEV__ = true
  console.log(__DEV__)
  loadlive2d("live2d", resolvePath('./live2d_models/live2d-widget-model-tsumiki/assets/tsumiki.model.json'));
  // loadlive2d("live2d", "./live2d_models/Pio/assets/model.json");
  // loadlive2d("live2d", "./live2d_models/Tia/model.json");
  // loadlive2d("live2d", "./live2d_models/live2d-widget-model-shizuku/assets/shizuku.model.json");

  if(!window.electron) return
  const {remote, dialog, ipcRenderer} = window.electron

  let curMousePos = {}
  function dp() {
    const mousePos = remote.screen.getCursorScreenPoint()
    if(mousePos.x !== curMousePos.x || mousePos.y !== curMousePos.y) {
      curMousePos = mousePos
      const winPos = remote.getCurrentWindow().getPosition()
      const winSize = remote.getCurrentWindow().getSize()
      window.dispatchEvent(new MouseEvent('mousemove', {clientX: mousePos.x - winPos[0], clientY: mousePos.y - winPos[1]}))
    }
    requestAnimationFrame(dp)
  }
  dp()
}



/*setInterval(() => {
  console.log(win)
}, 5000)*/
