/*global Qiniu */
/*global plupload */
/*global FileProgress */
/*global hljs */
function login(){
    servyouCloud.auth({userId:'admin',password:'123'});


}

function load(){
    var list = servyouCloud.list();
    $('#file-list').html('');
    for(var i=0;i<list.length;i++){
        var item = list[i];
         var tr = $('<tr><td>'+i+'</td><td>'+item.id+'</td><td>'+item.name+'</td><td>'+item.fileSize+'</td><td>'+item.modifyTime+'</td></tr>');
        $('#file-list').append(tr);
    }
}



$(function() {

    var globalConfig = {
        //global
        userId:'admin',
        password:'123',
        domain:'http://localhost:8080/sfs/',
        token_url:'sfs/login',
        list_url:'sfs/listSubDirtAndFile',

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

   // alert(decodeURIComponent("%E7%9B%B8%E5%90%8C%E7%9B%AE%E5%BD%95%E4%B8%8B%E6%96%87%E4%BB%B6%E5%B7%B2%E7%BB%8F%E5%AD%98%E5%9C%A8"));

});
