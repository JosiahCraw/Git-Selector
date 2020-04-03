const {app, BrowserWindow, ipcMain, Menu, dialog} = require('electron')
const request = require('request')
const os = require('os')
const glob = require('glob')
const fs = require('fs')
const shell = require('shelljs')

Menu.setApplicationMenu(null)

shell.mkdir('.staging')
shell.cd('.staging')
shell.config.execPath = shell.which('node').toString()

let TOKEN = ''
let URL = 'https://eng-git.canterbury.ac.nz'

ipcMain.on('login-form-submission', (event, token) => {
    request(`${URL}/api/v4/projects?private_token=${token}`, { json: true}, (err, res, body) => {
        if (err) {
            console.log(err)
            event.reply('auth-failed', '')
        }
        if (res.statusCode === 200) {
            TOKEN = token
            event.reply('auth-successful')
        } else {
            event.reply('auth-failed')
        }
    })
})

ipcMain.on('get-git-groups', (event, arg) => {
    request(`${URL}/api/v4/groups?private_token=${TOKEN}`, { json: true }, (err, res, body) => {
        if (err) {
            console.log(err)
            // TODO Show error popup
        }
        if (res.statusCode === 200) {
            event.reply('git-groups', body)
        } else {
            console.log(`Error Status Code: ${res.statusCode}`)
        }
    })
})

ipcMain.on('open-folder-explorer', (event, currPath) => {
    if(os.platform() === 'linux' || os.platform() === 'win32'){
        dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: currPath
        }).then((folder) => {
            event.reply('selected-folder', folder.filePaths)
        })
    } else {
        dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: currPath
        }).then((folder) => {
            event.reply('selected-folder', folder.filePaths)
        })
    }
})

ipcMain.on('get-directory-files', (event, path, relative=false) => {
    if (relative) {
        glob(`${__dirname}/../../${path}/**/*`.replace(/(\s+)/g, '\\$1'), {mark: false} , (err, res) => {
            if (err) {
                console.log(err)
            } else {
                fileArray = []
                res.forEach(element => {
                    index = element.indexOf(`${path}/`.replace(/(\s+)/g, '\\$1')) + path.length + 1
                    fileArray.push(element.slice(index))
                })
                event.reply('directory-file-structure', fileArray)
            }
        })
    } else {
        glob(`${path}/**/*`, {mark: false} ,(err, res) => {
            if (err) {
                console.log(err)
            } else {
                event.reply('directory-file-structure', res)
            }
        })
    }
})

ipcMain.on('get-projects', (event, id) => {
    request(`${URL}/api/v4/groups/${id}/projects?private_token=${TOKEN}`, { json: true}, (err, res, body) => {
        if (err) {
            console.log(err)
        }
        if (res.statusCode === 200) {
            event.reply('group-projects', body)
        } else {
            console.log(`Error Status Code: ${res.statusCode}`)
        }
    })
})

ipcMain.on('copy-files', (event, files, dest) => {
    shell.cd(`${__dirname}/../../.staging`.replace(/(\s+)/g, '\\$1'))
    files.forEach(element => {
        shell.cp('-r',`${element}`, dest)
    })
})

ipcMain.on('comment-update', (event, comment, project) => {
    console.log(project)
    fs.writeFile(`${__dirname}/../../.data/${project}.json`.replace(/(\s+)/g, '\\$1'), comment, (err) => {
        if (err) {
            console.log(err)
        }
    })
})

ipcMain.on('pull-project', (event, uri, name) => {
    if (!shell.which('git')) {
        console.log('program requires git')
    } else {
        fs.readFile(`${__dirname}/../../.data/${name}.json`.replace(/(\s+)/g, '\\$1'), 'utf8', (err, contents) => {
            if (err) {
                if (err.errno === -2) {
                    fs.writeFile(`${__dirname}/../../.data/${name}.json`.replace(/(\s+)/g, '\\$1'), 'Enter Comments', (err) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                } else {
                    console.log(err)
                }
            } else {
                event.reply('initial-comment-data', contents)
            }
        })
        if (shell.exec(`git clone ${uri}`).code === 0) {
            event.reply('pull-complete', name)
            event.reply('initial-comment', )
        } else {
            console.log(`Clone Failed for URI ${uri}`)
            event.reply('pull-complete', name)
        }
    }
})

ipcMain.on('get-url', (event) => {
    event.reply('get-url', URL)
})

ipcMain.on('set-url', (event, url) => {
    URL = url
})

const createWindow = () => {
    window = new BrowserWindow({
        width: 800, height: 900,
        darkTheme: true, 
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true
        }
    })
    window.loadURL(`file://${__dirname}/../html/index.html`)
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        shell.cd(`${__dirname}/../..`.replace(/(\s+)/g, '\\$1'))
        shell.rm('-rf', '.staging')
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})