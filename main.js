const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./renderer/MusicDataStore')

const myStore = new DataStore({'name': 'Music Data'})
class AppWindow extends BrowserWindow{
  constructor(config, fileLocation){
    const basicConfig = {
      width: 800,
      heigh: 600,
      webPreferences: {
      nodeIntegration: true
     }
    }
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show',() =>{//优化加载界面
      this.show()
    })
  }
}
app.on('ready', () =>{
  
})
