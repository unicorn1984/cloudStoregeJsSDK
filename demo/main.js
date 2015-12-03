/*global Qiniu */
/*global plupload */
/*global FileProgress */
/*global hljs */
function login(){
    servyouCloud.auth({userId:'admin',password:'123'});


}



$(function() {

    var globalConfig = {
        //global
        userId:'admin',
        password:'123',
        domain:'http://localhost:8080/sfs/',
        token_url:'sfs/login',

        //upload
        runtimes: 'html5,flash,html4',
        browse_button: 'pickfiles',
        container: 'container',
        drop_element: 'container',
        max_file_size: '100mb',
        flash_swf_url: 'lib/plupload/Moxie.swf',
        dragdrop: true,
        chunk_size: '4mb',
        upload_url:'sfs/addFile',   //上传文件路径
        get_new_uptoken: false,
        auto_start: true,
        multi_selection: false,
        init: {
            auth_success:function(data){
                $('#login-info').text(data.token);
                $('#token-area').show();
            },
            auth_error:function(msg){
                alert('授权失败');
            }
        }

    }


    window.servyouCloud = new ServyouCloudJsSDK(globalConfig);
    var uploader = servyouCloud.uploader();



});
