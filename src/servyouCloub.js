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

    auth: function (option) {
        var that = this;
        $.ajax({
            url: this.config.domain + this.config.token_url,
            data: {requestId: 'sfs/login', userId: option.userId, password: option.password},
            method: 'POST',
            success: function (data, textStatus, jqXHR) {
                if (data === "") {
                    that.config.init.auth_error();
                    return;
                }
                that.token = jqXHR.getResponseHeader("token");
                that.config.init.auth_success({token: that.token});
            },
            error: function (jqXHR, textStatus, errorThrown) {
                that.config.init.auth_error();
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


        uploader.bind('FilesAdded', function (up, files) {
            var auto_start = up.getOption && up.getOption('auto_start');
            auto_start = auto_start || (up.settings && up.settings.auto_start);
            if (auto_start) {
                plupload.each(files, function (i, file) {
                    up.start();
                });
            }
            up.refresh(); // Reposition Flash/Silverlight
        });
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
    }
}






