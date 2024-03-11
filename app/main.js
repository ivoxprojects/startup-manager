const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const Registry = require("winreg")
const fs = require('fs')
const path = require("path")

const startupFolderPath = process.env.AppData + "\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"

const createWindow = () => {
    win = new BrowserWindow({
        width: 550,
        height: 442,
        title: "Startup Manager",
        center: true,
        maximizable: false,
        resizable: false,
        autoHideMenuBar: true,
        show: false,
        icon: path.join(__dirname + "/src/icon.ico"),

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    })

    win.setMenu(null)
    win.loadFile(path.join(__dirname) + "/src/index.html")

    win.once("ready-to-show", () => {
        win.show()
    })
}


ipcMain.on("open-filedialog", () => {
    dialog.showOpenDialog(win, {
        properties: ['openFile']
      }).then(async result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0]

            await new Promise((resolve, reject) => {
                fs.copyFile(filePath, startupFolderPath+"\\"+path.basename(filePath), (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(win.webContents.send("append-list", path.basename(filePath), path.basename(filePath)))
                    }
                })
            })
        }
      }).catch(err => {
        console.error(err)
      })
})

ipcMain.on("reload-list", async () => {
    win.webContents.send("purge-list")

    const files = await new Promise((resolve, reject) => {
        fs.readdir(startupFolderPath, (err, files) => {
            if (err) {
                reject(err)
            } else {
                resolve(files)
            }
        })
    })

    files.forEach(file => {
        win.webContents.send("append-list", file, file)
    })


    const regKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    });

    const keys = await new Promise((resolve, reject) => {
        regKey.values((err, keys) => {
            if (err) {
                reject(err)
            } else {
                resolve(keys)
            }
        })
    })

    keys.forEach(key => {
        if (key.type == "REG_SZ") {
            win.webContents.send("append-list", key.name, key.value)
        }
    })
})

ipcMain.on("remove-file", async (event, file) => {
    try {
        await new Promise((resolve, reject) => {
            fs.unlink(startupFolderPath+"\\"+file, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    } catch {
        const regKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
        });
    
        await new Promise((resolve, reject) => {
            regKey.remove(file, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    } finally {
        win.webContents.send("removed-file")
    }
})

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})