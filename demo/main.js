/*global Qiniu */
/*global plupload */
/*global FileProgress */
/*global hljs */
function login(){
    ServyouCloub.auth({username:'admin',password:'123'});


}

function getToken(){
    alert(ServyouCloub.getToken());
}

$(function() {

    var globalConfig = {
        userId:'admin',
        password:'123',
        domain:''

    }

    var uploadConfig = {
        runtimes: 'html5,flash,html4',
        browse_button: 'pickfiles',
        container: 'container',
        drop_element: 'container',
        max_file_size: '100mb',
        flash_swf_url: 'lib/plupload/Moxie.swf',
        dragdrop: true,
        chunk_size: '4mb',
        uptoken_url: $('#uptoken_url').val(),
        domain: $('#domain').val(),
        get_new_uptoken: false,
        auto_start: true,
        init: {

        }
    }
    window.servyouCloub = new ServyouCloubJsSDK(globalConfig);



});
