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

    auth: function (option,success,error) {
        var that = this;
        $.ajax({
            url: this.config.domain + this.config.token_url,
            data: {requestId: 'sfs/login', userId: option.userId, password: option.password},
            method: 'POST',
            success: function (data, textStatus, jqXHR) {
                if (data === "") {
                    error();
                    return;
                }
                that.token = jqXHR.getResponseHeader("token");
                success({token: that.token});
            },
            error: function (jqXHR, textStatus, errorThrown) {
                error();
            }
        })
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
            url: this.config.domain + op.upload_url

        });


        var uploader = new plupload.Uploader(option);
        uploader.bind('BeforeUpload', function (up, file) {
            if (!that.token)
                throw 'token is required!';
            up.setOption({
                'multipart_params': {
                    requestId: 'sfs/addFile',
                    token: that.token,
                    userId: that.config.userId
                }
            });
        })

        uploader.init();


        return uploader;
    },
    /**
     * 获取文件夹和文件列表
     */
    list:function(option){
        if (!this.config.domain) {
            throw 'uptoken_url or domain is required!';
        }
        if (!this.token)
            throw 'token is required!';

        var that = this;
        var returnList;
        $.ajax({
            url: this.config.domain + this.config.list_url,
            data: {requestId: 'sfs/listSubDirtAndFile', userId: that.config.userId, token: that.token},
            method: 'POST',
            async:false,
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
        return returnList;
    },
    download:function(fileId){
         var url = this.config.domain+this.config.down_url
         var data = '?requestId=sfs/downloadObject&token='+this.token+'&userId='+this.config.userId+'&fileId='+fileId;
         url = url + data;
         window.open(url);
    }
}






