const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery')
const jstree = require('jstree')
require('bootstrap')


ipcRenderer.on('auth-failed', (event) => {
    $('#token_form').val("")
    // TODO Show popup
})

ipcRenderer.on('auth-successful', (event) => {
    $('#login').hide()
    $('#content').css("-webkit-filter", "blur(0px)")
    ipcRenderer.send('get-git-groups', '')
})

ipcRenderer.on('git-groups', (event, groups) => {
    $('#group-dropdown li').remove()
    groups.forEach(element => {
        $('#group-dropdown').append(`<li><a id=${element.id} class="group-item dropdown-item" group-name="${element.name}" href="#">${element.name}</a></li>`)
    })
    $('.group-item').click(function() {
        $('#group-name').text($(this).attr("group-name"))
        ipcRenderer.send('get-projects', $(this).attr("id"))
    })
})

ipcRenderer.on('group-projects', (event, projects) => {
    $('#project-dropdown li').remove()
    projects.forEach(element => {
        name = element.path_with_namespace.split('/')[1]
        $('#project-dropdown').append(`<li><a id=${element.id} git-uri="${element.ssh_url_to_repo}" repo-name="${name}" class="project-item dropdown-item" href="#">${element.name}</a></li>`)
    })
    $('.project-item').click(function() {
        ipcRenderer.send('pull-project', $(this).attr("git-uri"), $(this).attr("repo-name"))
        $('#project-name').text($(this).attr("repo-name"))
    })
})

ipcRenderer.on('selected-folder', (event, path) => {
    if (path[0] !== undefined) {
        $('#path-holder').val(path[0])
    }
})

ipcRenderer.on('pull-complete', (event, name) => {
    $('#file-tree').attr('repo-name', name)
    ipcRenderer.send('get-directory-files', `.staging/${name}`, true)
})

ipcRenderer.on('directory-file-structure', (event, paths) => {
    $('#tree-list li').remove()
    $('#tree-list ul').remove()
    let fileTree = [
        {"id": $('#file-tree').attr('repo-name'), "parent": "#", "text": $('#file-tree').attr('repo-name')}
    ];
    paths.forEach(element => {
        pathList = element.split('/')
        pathList = pathList.filter((el) => {
            return el != ''
        })
        if (pathList.length <= 1) {
            fileTree.push({"id": pathList[0], "parent": $('#file-tree').attr('repo-name'), "text":pathList[0]})
        } else if (pathList.length === 2) {
            fileTree.push({
                "id": `${pathList[pathList.length-2]}-${pathList[pathList.length-1]}`,
                "parent": `${pathList[pathList.length-2]}`,
                "text": pathList[pathList.length-1]
            })
        } else {
            fileTree.push({
                "id": `${pathList[pathList.length-2]}-${pathList[pathList.length-1]}`,
                "parent": `${pathList[pathList.length-3]}-${pathList[pathList.length-2]}`,
                "text": pathList[pathList.length-1]
            })
        }
    })

    $('#file-tree').jstree("destroy").empty()
    $('#file-tree').jstree({
        'core': {
            'data' : fileTree,
            "themes" : {
                "name" : "proton",
                "responsive" : true
            }
        },
        "checkbox": {
            "three_state" : false,
            "keep_selected_style" : false
        },
        "plugins" : ["checkbox"]
    })
})

ipcRenderer.on('get-url', (event, url) => {
    $('#url-form').val(url)
})

ipcRenderer.on('initial-comment-data', (event, comment) => {
    $('#comments').val(comment)
})

$(document).ready( function () {
    $('#token-submit').click(() => {
        let token = $('#token_form').val()
        ipcRenderer.send('login-form-submission', token)
    })

    $('#url-form').keyup(function () {
        ipcRenderer.send('set-url', $('#url-form').val())
    })

    $('#group-search').on("keyup", function () {
        let param = $(this).val().toLowerCase()
        $('.group-dropdown li').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(param) > -1)
        })
    })

    $('#project-search').on("keyup", function () {
        let param = $(this).val().toLowerCase()
        $('.project-dropdown li').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(param) > -1)
        })
    })

    $('#browse-files').click( () => {
        ipcRenderer.send('open-folder-explorer', $('#path-holder').val())
    })

    $('#move').click( () => {
        let selectedFiles = []
        $('#file-tree').jstree("get_selected").forEach(element => {
            selectedFiles.push($('#file-tree').jstree(true).get_path(element, "/"))
        })
        ipcRenderer.send('copy-files', selectedFiles, $('#path-holder').val())
    })
    $('#comments').keyup(function () {
        ipcRenderer.send('comment-update', $(this).val(), `${$('#file-tree').attr("repo-name")}`)
    })

    ipcRenderer.send('get-url');
})