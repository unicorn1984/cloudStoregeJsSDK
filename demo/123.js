/**
 * Created by pzf on 2015/12/7.
 */
function getResponseHeaderValue(origin,key){
    var reg = new RegExp("(resultCode:\\s)(\\d{8})");
    console.log(reg.test(origin));
    console.log(origin.match(reg));
}

var string = '222resultCode: 88880022222';

getResponseHeaderValue(string,"resultCode");