# Git Selector

This App is designed to revolutionize the world of Zoom tutoring :smile: , not really but I wanted an excuse to try Electron so I made this. :gem:

## Contents
1.  [The App](#app)
2.  [Installation](#install)
    -   [Running from source](#source)
    -   [Downloads](#downloads)
3.  [Usage](#use)
4.  [TODO](#todo)
5.  [Author](#author)

## Images

First some pretty (I think) pictures :camera:

|                                |                                |                                |
| -------------------------------|--------------------------------|--------------------------------|
| ![Image 0](wiki/img/demo0.png) | ![Image 1](wiki/img/demo1.png) | ![Image 2](wiki/img/demo2.png) |


<a name="app"></a>

## 1. The App
This app is designed to make tutoring University coding courses a little bit easier, specifically ENCE361 and ENEL373 at the University of Canterbury.
It does this by giving a GUI for searching through GitLab groups and projects and cloning them into a temporary location and displaying a directory structure for the repository.
This makes the process of getting the students code into a template such as [CMake](https://git.sys-io.net/projects/ENCE361/repos/tiva-cmake-template) (like for ENCE361)
The app also supports local commenting making it easier to catchup to where you left off.

<a name="install"></a>

## 2. Installation
Ensure that NPM is installed on your machine and run the following command:

```console
user@computer:~$ npm run package-linux //linux can be replaced with win or mac depending on your operating system
```

On Windows you can run this command from git bash once NPM is installed

I have found some issues with native windows packaging however luckily I have included a working Windows executable in [downloads](#downloads), it seems like if you have a space in 
your user name it causes npm to fail. Windows does work running from source though. For windows ensure that you have installed [Git for Windows](https://git-scm.com/download/win)
and the Windows command line can access git.

This will create a package in `release-builds/`

Alternatively you could try install using `.deb`, `.pacman` or `.snap` I haven't tested these properly but had some issues with snap not being able to access git.
```console
user@computer:~$ npm run dist
```

This dist command will by default build for all operating systems to change this go to [package.json](package.json) and change the `"dist"` command under `"scripts"` to `"electron-builder -w"` for Windows `-m` for Mac etc.

This command will package the program based on the contents of `build` in [package.json](package.json) to, for example, only build .deb replace all items in `"build"` with:
```json
{
    "appId": "net.sys-io.git-selector",
    "linux": {
        "target": "deb"
    }
}
```

Or to build NSIS and portable for Windows use:
```json
{
    "appId": "net.sys-io.git-selector",
    "win": {
        "target": [
            "nsis",
            "portable"
        ],
        "icon": "build/icon.ico"
    }
}
```

<a name="source"></a>

### Running from source
Running for source should work automatically for all Operating Systems (Untested)
```console
user@computer:~$ npm run start
```
This command executes both `npm install` and `electron .` the available commands can be found in `package.json`

<a name="downloads"></a>

### Downloads
-   [Linux](https://storage.googleapis.com/git-selector/v0.0.1/git-selector-linux-x64.zip)
-   [Windows](https://storage.googleapis.com/git-selector/v0.0.1/git-selector-win32-ia32.zip)
-   [Mac](https://storage.googleapis.com/git-selector/v0.0.1/Git%20Selector%20Application-darwin-x64.zip)

<a name="use"></a>

## 3. Usage
This section will be mostly pictures :tada:

![Start Up Screen](wiki/img/login-screen.png)

To access get in all you need to do is enter the GitLab URL for the instance you are connecting to (for these examples I will be using the University of Canterbury Eng Git Server)
and the personal access token for your account on the given server find out how to make one [here](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#creating-a-personal-access-token).

The software also expects you to be using git with ssh.

![Main Screen](wiki/img/main-screen.png)

Once you enter your token and hit submit this screen will be available the top navigation bar contains two drop downs, these allow you to search and select the group/project you would like to work with. A help icon is also located on this navbar.

![All sections loaded](wiki/img/projects-shown.png)

This shows the app with an ENEL373 test repository in this example I am copying VHDL design sources into a setup project, this case makes it easier to quickly copy many students code into a demo project.

<a name="todo"></a>

## 4. TODO
:negative_squared_cross_mark: Use paging on GitLab API to make projects and groups load in gradually and not limit to first 100 projects

:pencil2: Add preferences

:pencil2: Allow users to clear selections

:pencil2: Add portable git for windows

:pencil2: Test on MacOS

:pencil2: Test on Windows

:pencil2: Add Branch support

:pencil2: Make the comments centrally available

:pencil2: Automatically build executables

:pencil2: Create unit tests

Get it, penciled in, I crack myself up :laughing:

Yes I just discovered emojis in BitBucket that why there are so many

<a name="author"></a>

## 5. Author
Jos Craw <jos@joscraw.net>
