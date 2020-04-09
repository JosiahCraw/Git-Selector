const {app, BrowserWindow, ipcMain, Menu, dialog} = require('electron')
const request = require('request')
const os = require('os')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const exec = require('child_process').exec

Menu.setApplicationMenu(null)

let TOKEN = ''
let URL = 'https://eng-git.canterbury.ac.nz'
let basePath = app.getPath("home")
let dirname = `${basePath}/.git-selector`

shell.cd(basePath)
shell.mkdir('.git-selector')
shell.cd('.git-selector')
shell.mkdir('.staging')
shell.mkdir('.data')

ipcMain.on('login-form-submission', (event, token) => {
    request(`${URL}/api/v4/user?private_token=${token}`, { json: true}, (err, res, body) => {
        if (err) {
            console.log(err)
            event.reply('auth-failed', '')
        }
        if (res.statusCode === 200) {
            TOKEN = token
            event.reply('auth-successful', body.username, body.avatar_url)
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
        pages = res.headers["x-total-pages"]
        for (var i=2; i<pages; i++) {
            request(`${URL}/api/v4/groups?private_token=${TOKEN}&simple=true&membership=true&page=${i}`, { json: true}, (err, res, body) => {
                event.reply('add-groups', body)
            })
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
        glob(`${dirname}/${path}/**/*`.replace(/(\s+)/g, '\$1'), {mark: false} , (err, res) => {
            if (err) {
                console.log(err)
            } else {
                fileArray = []
                res.forEach(element => {
                    index = element.indexOf(`${path}/`.replace(/(\s+)/g, '\$1')) + path.length + 1
                    fileArray.push(element.slice(index))
                })
                event.reply('directory-file-structure', fileArray)
            }
        })
    } else {
        glob(`${path}/**/*`, {mark: false}, (err, res) => {
            if (err) {
                console.log(err)
            } else {
                event.reply('directory-file-structure', res)
            }
        })
    }
})

ipcMain.on('get-all-projects', (event) => {
    request(`${URL}/api/v4/projects?private_token=${TOKEN}&simple=true&membership=true`, { json: true}, (err, res, body) => {
        if (err) {
            console.log(err)
        }
        if (res.statusCode === 200) {
            event.reply('group-projects', body)
        } else {
            console.log(`Error Status Code: ${res.statusCode}`)
        }
        pages = res.headers["x-total-pages"]
        for (var i=2; i<pages; i++) {
            request(`${URL}/api/v4/projects?private_token=${TOKEN}&simple=true&membership=true&page=${i}`, { json: true}, (err, res, body) => {
                event.reply('add-projects', body)
            })
        }
    })
})

ipcMain.on('get-projects', (event, id) => {
    request(`${URL}/api/v4/groups/${id}/projects?private_token=${TOKEN}&simple=true`, { json: true}, (err, res, body) => {
        if (err) {
            console.log(err)
        }
        if (res.statusCode === 200) {
            event.reply('group-projects', body)
        } else {
            console.log(`Error Status Code: ${res.statusCode}`)
        }
        pages = res.headers["x-total-pages"]
        for (var i=2; i<pages; i++) {
            request(`${URL}/api/v4/projects?private_token=${TOKEN}&simple=true&membership=true&page=${i}`, { json: true}, (err, res, body) => {
                event.reply('add-projects', body)
            })
        }
    })
})

ipcMain.on('copy-files', (event, files, dest) => {
    shell.cd(`${dirname}/.staging`.replace(/(\s+)/g, '\$1'))
    files.forEach(element => {
        shell.cp('-r',`${element}`, dest)
    })
})

ipcMain.on('comment-update', (event, comment, project) => {
    fs.writeFile(`${dirname}/.data/${project}.json`.replace(/(\s+)/g, '\$1'), comment, (err) => {
        if (err) {
            console.trace(err)
        }
    })
})

ipcMain.on('pull-project', (event, uri, name) => {
    fs.readFile(`${dirname}/.data/${name}.json`.replace(/(\s+)/g, '\\$1'), 'utf8', (err, contents) => {
        if (err) {
            if (err.errno === -2 || err.errno === -4058) {
                fs.writeFile(`${dirname}/.data/${name}.json`.replace(/(\s+)/g, '\$1'), '', (err) => {
                    if (err) {
                        console.trace(err)
                    } else {
                        event.reply('initial-comment-data', '')
                    }
                })
            } else {
                console.trace(err)
            }
        } else {
            event.reply('initial-comment-data', contents)
        }
    })
    
    let winGitPath = undefined
    let gitPath = undefined
    if (process.env.NODE_ENV !== 'dev') {
        winGitPath = path.join(process.resourcesPath, 'git/bin/git.exe')
        gitPath = `${process.resourcesPath}/git/bin/git`.replace(/(\s+)/g, '\\$1')
    } else {
        winGitPath = path.join(__dirname, '../lib/git-win/bin/git.exe')
        gitPath = `${__dirname}/../lib/git-linux/bin/git`.replace(/(\s+)/g, '\\$1')
    }

    let clone = undefined;
    if (os.platform() == 'win32') {
        clone = exec(`echo $PATH && cd ${basePath}\\.git-selector\\.staging && "${winGitPath}" clone ${uri}`, (error, stdout, stderr) => {
            if (error) {
                console.trace(error)
                console.log('STDOUT: '+stdout)
                console.log('STDERR: '+stderr)
            }
            event.reply('pull-complete', name)
        })
    } else {
        gitPath = gitPath.replace(/(\s+)/g, '\$1')
        clone = exec(`cd ${dirname}/.staging && exec ${gitPath} clone ${uri}`, (error, stdout, stderr) => {
            if (error) {
                console.trace(error)
                console.log('STDOUT: '+stdout)
                console.log('STDERR: '+stderr)
            }
            event.reply('pull-complete', name)
        })
    }

    clone.on('exit', (code) => {
        console.log(code)
    })
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
        icon: `${__dirname}/../img/app-logo.png`,
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
        shell.cd(`${dirname}`.replace(/(\s+)/g, '\$1'))
        shell.rm('-rf', '.staging')
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
