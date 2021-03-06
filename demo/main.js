/*global Qiniu */
/*global plupload */
/*global FileProgress */
/*global hljs */
window.pageCT = (function () {
    function login() {
        servyouCloud.auth({userId: 'admin', password: '123'}, function (data) {
                $('#loginModal').modal('hide')
                $('#login-info').text("limitSize:" + data.limitSize + "    usedSize:" + data.usedSize + "    userId:" + data.userId + "    storageKey:" + data.storageKey + "     token:" + data.token);
                $('#token-area').show();

            },
            function (msg) {
                alert('授权失败');
            });


    }
    function init(){
        initTree();
        initSDK();
        initEvent();
    }
    function initTree() {

        var data = [{"id": "", "parent": "", "name": "根目录", isParent: true}];
        window.treeObj = $.fn.zTree.init($("#folder-tree"), {
            edit: {
                enable: false
            },
            view: {
                addHoverDom: addHoverDom,
                removeHoverDom: removeHoverDom
            },
            callback: {
                beforeExpand: beforeExpand,
                onClick: onClick

            }
        }, data);

    }
    function initSDK(){
        var globalConfig = {
            //global
            userId: 'admin',
            password: '123',
            domain: 'http://192.168.60.16:8080/sfs/',
            //upload
            runtimes: 'html5,flash,html4',
            browse_button: 'pickfiles',
            max_file_size: '100mb',
            flash_swf_url: 'lib/plupload/Moxie.swf',

            upload_events: {
                PostInit: function () {
                    $('#filequeue ul').html('');
                },

                FilesAdded: function (up, files) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        $('#filequeue table').append('<tr><td width="20%">' + file.name + '</td><td  width="40%"><div id=progress_' + file.id + ' class="progress"><div class="progress-bar progress-bar-success" role="progressbar"></div></div></td><td class="red" id="error_' + file.id + '"></td></li>');
                        up.start();
                    }

                },

                UploadProgress: function (up, file) {
                    $('#progress_' + file.id + " .progress-bar").width(file.percent + '%').html('complete ' + file.percent + '%');
                },


                BeforeUpload: function (up, file) {
                    up.setOption({
                        'multipart_params': {
                            directoryId: window.pageCT.selectedFolderId

                        }
                    });
                },
                FileUploaded: function (up, file, response) {
                    $('#state_' + file.id).html("上传完毕！");
                },
                Error: function (up, err) {
                    $('#error_' + err.file.id).html("Error：[" + err.code + "] " + err.message);
                }

            }

        }


        window.servyouCloud = new ServyouCloudJsSDK(globalConfig);
        var uploader = servyouCloud.uploader();
    }
    function initEvent(){
        $('#loginbtn').on('click',function(e){
            login();
        });
        $('#file-list').on('click',function(e){
            tableClick(e);
        });
        $('#addFolderBtn').on('click',function(e){
            addFolder();
        });
        $('#renameFolderBtn').on('click',function(e){
           renameFolder();
        });
        $('#renameFileBtn').on('click',function(e){
            renameFile();
        });
        $('#refreshBtn').on('click',function(e){
            refeshFiles();
        });


    }
    function tableClick(e){
        var target = $(e.target);
        if(target.hasClass("operateColumn")){
            if(target.hasClass("download")){
                download($(target.parent().parent().children()[1]).text());
            }
            else if(target.hasClass("rename")){
                showRenameFileModal($(target.parent().parent().children()[1]).text(),$(target.parent().parent().children()[2]).text());
            }
            else if(target.hasClass("delete")){
                deleteFile($(target.parent().parent().children()[1]).text());
            }
        }
        e.preventDefault();
    }
    function addHoverDom(treeId, treeNode) {
        var sObj = $("#" + treeNode.tId + "_span");
        if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
        var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
            + "' title='add node' onfocus='this.blur();'></span>";
        addStr += "<span class='button edit' id='editBtn_" + treeNode.tId
        + "' title='add node' onfocus='this.blur();'></span>";
        addStr += "<span class='button remove' id='delBtn_" + treeNode.tId
        + "' title='add node' onfocus='this.blur();'></span>";
        sObj.after(addStr);
        var addbtn = $("#addBtn_" + treeNode.tId);
        if (addbtn) addbtn.bind("click", function () {
            showAddFolderModel(treeNode);
        });
        var editbtn = $("#editBtn_" + treeNode.tId);
        if (editbtn) editbtn.bind("click", function () {
            showRenameFolderModel(treeNode);
        });
        var delbtn = $("#delBtn_" + treeNode.tId);
        if (delbtn) delbtn.bind("click", function () {
            removeFolder(treeNode);
        });

    };
    function removeHoverDom(treeId, treeNode) {
        $("#addBtn_" + treeNode.tId).unbind().remove();
        $("#editBtn_" + treeNode.tId).unbind().remove();
        $("#delBtn_" + treeNode.tId).unbind().remove();

    };
    function beforeExpand(treeId, treeNode) {
        if (treeNode.children) return;
        loadDictionary(treeNode.id, function (nodes) {
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    loadDictionary(node.id, function (childs) {
                        if (childs.length > 0)
                            node.isParent = true;
                    }, false)

                }
                window.treeObj.addNodes(treeNode, -1, nodes, true);
            },
            function () {
                alert('error');
            },
            false
        )
    }

    function onClick(event, treeId, treeNode, clickFlag) {
        window.pageCT.selectedFolderId = treeNode.id;
        loadFiles(treeNode.id);
    }

    function transformToNode(folder) {
        var node = {};
        node.id = folder.id;
        node.name = folder.name;
        return node;
    }

    function loadDictionary(parentFolderId, success, error) {
        var list = servyouCloud.list({directoryId: parentFolderId}, function (data) {
            //获取目录数data
            var folders = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if (item.type === 'D') {
                    var node = transformToNode(item);
                    node.parent = parentFolderId;
                    folders.push(node);
                }
            }
            success(folders);
        }, function () {
            error()
        });


    }

    function loadFiles(folderId) {
        var list = servyouCloud.list({directoryId: folderId}, function (data) {
            $('#file-list tbody').html('');
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if (item.type === 'D')
                    continue;
                var tr = $('<tr><td>' + i + '</td><td>' + item.id + '</td><td>' + item.name + '</td><td>' + item.fileSize + '</td><td>' + item.modifyTime + '</td><td><a href="#" class="operateColumn download">下载</a>&nbsp;&nbsp;<a href="#" class="operateColumn rename">重命名</a>&nbsp;&nbsp;<a href="#" class="operateColumn delete">删除</a></td></tr>');
                $('#file-list tbody').append(tr);
            }
        }, function () {
            alert('error')
        })

    }

    function deleteFile(fileId) {
        if (confirm("确认删除此文件吗？") == true) {
            servyouCloud.removeFile({fileId: fileId}, function () {
                alert('删除成功');
                refeshFiles();
            }, function (errorMsg) {
                alert(errorMsg);
            });
        }


    }

    function showRenameFileModal(fileId, fileName) {
        $('#newFileName').val(fileName);
        window.pageCT.fileId = fileId;//整个页面临时变量
        $('#renameFileModal').modal('show');

    }

    function renameFile() {
        var newFileName = $('#newFileName').val();
        servyouCloud.renameFile({fileId: window.pageCT.fileId, newFileName: newFileName}, function () {
            alert('修改成功');
            refeshFiles();
            $('#renameFileModal').modal('hide');
        }, function (errorMsg) {
            alert(errorMsg);
        });
    }

    function download(fileId) {
        servyouCloud.download({fileId: fileId});
    }

    function refeshFiles() {
        loadFiles(window.pageCT.selectedFolderId);
    }

    function removeFolder(folder) {
        if (confirm("确认删除此文件夹吗？") == true) {
            servyouCloud.removeDirectory({directoryIds: folder.id}, function () {
                alert('删除成功');
                window.treeObj.removeNode(folder);
            }, function (errorMsg) {
                alert(errorMsg);
            });
        }

    }

    function showRenameFolderModel(folder) {
        window.pageCT.editFolder = folder;
        $('#renameNewFolderName').val(folder.name);
        $('#renameFolderModal').modal('show');
    }

    function renameFolder() {
        var name = $('#renameNewFolderName').val();
        if(name.trim() === ""){
            alert('文件名不能为空');
            return;
        }
        servyouCloud.renameDirectory({directoryId: window.pageCT.editFolder.id,dirName:name}, function () {
            alert('修改成功');
            $('#renameFolderModal').modal('hide');
            window.pageCT.editFolder.name = name;
            window.treeObj.updateNode(window.pageCT.editFolder);
        }, function (errorMsg) {
            alert(errorMsg);
        });
    }

    function showAddFolderModel(folder) {
        $('#addNewFolderName').val('');
        window.pageCT.editFolder = folder;
        $('#createFolderModal').modal('show');
    }

    function addFolder() {
        var name = $('#addNewFolderName').val();
        if(name.trim() === ""){
            alert('文件名不能为空');
            return;
        }
        servyouCloud.createDirectory({parentDirId: window.pageCT.editFolder.id,dirName:name}, function (directoryId) {
            alert('添加成功');
            window.treeObj.addNodes(window.pageCT.editFolder,-1,[{"id": directoryId, "parent": window.pageCT.editFolder.id, "name": name, isParent: false}],true);
            treeObj.expandNode(window.pageCT.editFolder,true,false,true,false);
            $('#createFolderModal').modal('hide');
        }, function (errorMsg) {
            alert(errorMsg);
        });
    }

    return {
        init: init

    }
})
()


$(function () {

    window.pageCT.init();


});
