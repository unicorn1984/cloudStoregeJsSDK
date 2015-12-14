function ServyouCloudJsSDK(config) {

    this.config = config;

}

ServyouCloudJsSDK.prototype = {


    parseJSON: function (data) {
        // Attempt to parse using the native JSON parser first
        if (window.JSON && window.JSON.parse) {
            return window.JSON.parse(data);
        }

        if (data === null) {
            return data;
        }
        if (typeof data === "string") {

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            data = this.trim(data);

            if (data) {
                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js
                if (/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, "@").replace(/"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {

                    return (function () {
                        return data;
                    })();
                }
            }
        }
    },

    auth: function (option, success, error, async) {
        var that = this;
        if (async === undefined)
            async = true;
        $.ajax({
            url: this.config.domain + "sfs/login",
            data: {requestId: 'sfs/login', userId: option.userId, password: option.password},
            method: 'POST',
            async: async
        }).done(function (data, textStatus, jqXHR) {
            if (data === "") {
                error();
                return;
            }
            that.token = jqXHR.getResponseHeader("token");
            data.storageKey = jqXHR.getResponseHeader("storageKey")
            data.token = that.token;
            success(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            error();
        })

    },
    getResponseHeaderValue: function (origin, key) {
        var reg = new RegExp("(" + key + ":\\s)(.*)(\\r\\n|\\r|\\n)");
        if (reg.test(origin)) {
            var arr = origin.match(reg);
            return arr[2];
        }
        return "";
    },
    uploader: function () {
        var op = this.config;
        var that = this;
        if (!op.domain) {
            throw 'uptoken_url or domain is required!';
        }

        if (!op.browse_button) {
            throw 'browse_button is required!';
        }
        //配置
        var option = {};


        plupload.extend(option, op, {
            url: this.config.domain + "sfs/addFile",
            multi_selection: false
        });


        var uploader = new plupload.Uploader(option);

        uploader.bind("PostInit", function (up) {
            op.upload_events.PostInit(up);
        })

        uploader.bind("FilesAdded", function (up, files) {
            op.upload_events.FilesAdded(up, files);
        });


        uploader.bind('BeforeUpload', function (up, file) {
            up.setOption({
                'multipart_params': {
                    requestId: 'sfs/addFile',
                    token: that.token,
                    userId: that.config.userId
                }
            });
            op.upload_events.BeforeUpload(up, file);
        });
        uploader.bind("UploadProgress", function (up, file) {
            op.upload_events.UploadProgress(up, file);
        });
        uploader.bind('FileUploaded', function (up, file, response) {
            var resultCode = that.getResponseHeaderValue(response.responseHeaders, "resultCode");
            if (resultCode === '00000000') {
                op.upload_events.FileUploaded(up, file, response);
            } else {
                var errorMsg = that.getResponseHeaderValue(response.responseHeaders, "errorMsg")
                errorMsg = decodeURIComponent(errorMsg);
                op.upload_events.Error(up, {code: resultCode, file: file, message: errorMsg});
            }

        });
        uploader.bind("Error", function (up, err) {
            alert("Error：[" + err.code + "] " + err.message);
            op.upload_events.Error(up, err);
        });
        uploader.init();


        return uploader;
    },
    /**
     * 获取文件夹和文件列表
     */
    list: function (option, success, error, async) {
        this.checkEntrance();
        if (async === undefined)
            async = true;
        var that = this;
        $.ajax({
            url: this.config.domain + "sfs/listSubDirtAndFile",
            data: {
                requestId: 'sfs/listSubDirtAndFile',
                userId: that.config.userId,
                token: that.token,
                directoryId: option.directoryId,
                dirFullPath: option.dirFullPath,
                directoryNum: option.directoryNum,
                startNum: option.startNum,
                fetchNum: option.fetchNum
            },
            method: 'POST',
            async: false
        }).done(function (data, textStatus, jqXHR) {
            if (data === "") {
                return;
            }
            data = that.parseJSON(data);
            success(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            error();
        })


    },
    download: function (option) {
        this.checkEntrance();
        var url = this.config.domain + "sfs/downloadObject"
        var data = '?requestId=sfs/downloadObject&token=' + this.token + '&userId=' + this.config.userId + '&fileId=' + option.fileId + '&customFileId=' + option.customFileId + '&offset=' + option.offset;
        url = url + data;
        window.open(url);
    },
    deleteFile: function (option, success, error, async) {
        var that = this;
        this.checkEntrance();
        if (async === undefined)
            async = true;
        var url = this.config.domain + "sfs/deleteObject"
        var data = {
            requestId: 'sfs/deleteObject',
            token: this.token,
            userId: this.config.userId,
            fileId: option.fileId,
            customFileId: option.customFileId
        };
        $.ajax({
            url: url,
            data: data,
            method: 'POST',
            async: false
        }).done(function (data, textStatus, jqXHR) {
            var resultCode = that.getResponseHeaderValue(jqXHR.responseHeaders, "resultCode");
            if (resultCode === '00000000') {
                success();
            } else {
                var errorMsg = that.getResponseHeaderValue(jqXHR.responseHeaders, "errorMsg")
                errorMsg = decodeURIComponent(errorMsg);
                error(errorMsg);
            }

        }).error(function (jqXHR, textStatus, errorThrown) {
            error();
        })

    },
    rename: function (fileId, newFileName, success, error, async) {
        this.checkEntrance();
        if (async === undefined)
            async = true;
        var url = this.config.domain + "sfs/renameFile";
        var data = {
            requestId: 'sfs/renameFile',
            token: this.token,
            userId: this.config.userId,
            fileId: fileId,
            newFileName: newFileName
        };
        $.ajax({
            url: url,
            data: data,
            method: 'POST',
            async: false,
            success: function (data, textStatus, jqXHR) {
                if (data === "") {
                    return;
                }
                data = that.parseJSON(data);
                returnList = data;
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        })
    },
    addDirectory: function (option, success, error, async) {
        this.checkEntrance();
        if (async === undefined)
            async = true;
        var url = this.config.domain + "sfs/addDirectory";
        var data = {
            requestId: 'sfs/addDirectory',
            userId: this.config.userId,
            token: this.token,
            parentDirId: option.parentDirId,
            dirName: option.dirName
        };
        $.ajax({
            url: url,
            data: data,
            method: 'POST',
            async: false,
            success: function (data, textStatus, jqXHR) {
                if (data === "") {
                    return;
                }
                data = that.parseJSON(data);
                returnList = data;
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        })
    },
    deleteDirectory: function (option, success, error, async) {
        this.checkEntrance();
        if (async === undefined)
            async = true;
        var url = this.config.domain + "sfs/deleteDirectory";
        var data = {
            requestId: 'sfs/deleteDirectory',
            token: this.token,
            userId: this.config.userId,
            directoryIds: option.directoryIds,
            dirFullPath: option.dirFullPath
        };
        $.ajax({
            url: url,
            data: data,
            method: 'POST',
            async: false,
            success: function (data, textStatus, jqXHR) {
                if (data === "") {
                    return;
                }
                data = that.parseJSON(data);
                returnList = data;
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        })
    },
    renameDirectory: function (option, success, error, async) {
        this.checkEntrance();
        if (async === undefined)
            async = true;
        var url = this.config.domain + "sfs/renameDirectoryName";
        var data = {
            requestId: 'sfs/renameDirectoryName',
            token: this.token,
            userId: this.config.userId,
            dirName: option.dirName,
            directoryId: option.directoryId
        };
        $.ajax({
            url: url,
            data: data,
            method: 'POST',
            async: false,
            success: function (data, textStatus, jqXHR) {
                if (data === "") {
                    return;
                }
                data = that.parseJSON(data);
                returnList = data;
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        })
    },
    /**
     * 判断入口条件是否符合
     */
    checkEntrance: function () {
        if (!this.config.domain) {
            throw 'uptoken_url or domain is required!';
        }
        if (!this.token)
            throw 'token is required!';
    }

}






