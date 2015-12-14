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

    function init() {
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
        var data = [{"id": "", "parent": "", "name": "根目录", isParent: true}];
        window.treeObj = $.fn.zTree.init($("#folder-tree"), {
            callback: {
                beforeExpand: beforeExpand,
                onClick: onClick
            }
        }, data);

    }

    function beforeExpand(treeId, treeNode) {
        if(treeNode.children) return;
        loadDictionary(treeNode.id, function (nodes) {
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    loadDictionary(node.id, function (childs) {
                        if (childs.length > 0)
                            node.isParent = true;
                    },false)

                }
                window.treeObj.addNodes(treeNode,-1, nodes,true);

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
            $('#file-list').html('');
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if (item.type === 'D')
                    continue;
                var tr = $('<tr><td>' + i + '</td><td>' + item.id + '</td><td>' + item.name + '</td><td>' + item.fileSize + '</td><td>' + item.modifyTime + '</td><td><a href="#" onclick="window.pageCT.download(' + item.id + ')">下载</a></td><td>' + item.type + '</td><td><a href="#" onclick="window.pageCT.deleteFile(' + item.id + ')">删除</a></td></tr>');
                $('#file-list').append(tr);
            }
        }, function () {
            alert('error')
        })

    }

    function deleteFile(fileId) {
        servyouCloud.deleteFile({fileId: fileId}, function () {
        }, function () {
        });
    }

    function download(fileId) {
        servyouCloud.download({fileId: fileId});
    }

    return {init: init, loadFiles: loadFiles, login: login, deleteFile: deleteFile}
})
()


$(function () {

    window.pageCT.init();


});
