// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const electron = require('electron')
const path = require('path')
const app = electron.app || electron.remote.app;

const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

const __DEV__ = isEnvSet ? getFromEnv : !app.isPackaged;

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  window.electron = electron
  window.__DEV__ = __DEV__

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
