ServyouCloud JavaScript SDK 使用指南
===================


**1.概述**

基于ServyouCloud API及Plupload开发的前端JavaScript SDK

示例：七牛JavaScript SDK 示例网站 - 配合七牛Node.js SDK

本SDK适用于IE8+、Chrome、Firefox、Safari 等浏览器，基于 ServyouCloud API 构建，其中上传功能基于 Plupload 插件封装。开发者使用本 SDK 可以方便的从浏览器端上传文件至税友云存储。本 SDK 可使开发者忽略上传底层实现细节。

----------


**功能简介**



> - 权限验证
> - 文件操作（上传，下载，重命名，删除）
> - 文件夹（新增，删除，重命名）.
> - 信息查询 (文件详细信息，文件列表)

**SDK构成介绍**

    Plupload ，建议 2.1.1 及以上版本
    jquery.js，建议1.6以上
    servyouCloud.js，SDK主体文件，上传功能\数据处理实现
    
**安装和运行**

引入Plupload

    Plupload下载，建议 2.1.1 及以上版本

    引入plupload.full.min.js（产品环境）或 引入plupload.dev.js和moxie.js（开发调试）
    
引入jQuery.js

    建议1.6以上版本

引入servyouCloud.js

    获取SDK源码 git clone git@github.com:qiniupd/qiniu-js-sdk.git，qiniu.js位于src目录内

