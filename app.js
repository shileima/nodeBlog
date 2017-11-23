/*
* 应用的初始入口文件*/

// 加载express 模块
var express = require('express');

// 加载模板处理模块
var swig = require('swig')

// 加载 body-parser
var bodyParser = require('body-parser')

//加载富文本编辑器
var ueditor = require('ueditor')

// 加载 path 模块
var path = require('path')

// 加载 cookies
var Cookies = require('cookies')

// 加载用户模块
var User = require('./models/User')

// 创建 APP 应用
var app = express();

// 设置静态文件托管,当用户访问的 url 中以/public开始，则直接返回对应的__dirname+'/public')下的文件
app.use('/public',express.static(__dirname+'/public'))

/*配置应用模板*/
// 定义当前应用的模板引擎, 第一个参数是模板引擎的名称，也是模板后缀；
// 第二个参数表示用于解析处理模板的方法
app.engine('html',swig.renderFile)

// 设置模板文件存放目录，第一个参数固定，第二个参数是路径
app.set('views','./views')

// 注册使用的模板引擎,第一个参数固定，第二个参数要和 app.engine 的第一个参数相同
app.set('view engine','html')

// 开发环境，取消模板缓存
swig.setDefaults({cache:false})

// 设置 body-parser 必须放在配置模板路由之前

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//ueditor 编辑器
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    //客户端上传文件设置
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = '/img/ueditor/';//默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/images/ueditor/';
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
}));


// 设置 cookies 模块

app.use(function(req, res, next){
    req.cookies = new Cookies(req, res)

    // 解析头部登录信息
    req.userInfo = {};

    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'))
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin)
                next()
            })
        }catch(e){
            next()
        }
    }else{
        next()
    }
})






// 配置模板路由
app.use('/', require('./routers/main'))
app.use('/api', require('./routers/api'))
app.use('/admin',require('./routers/admin'))




// 加载数据库模块
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/blog2',function(err){
    if(err){
        console.log('数据库连接失败')
    } else {
        console.log('数据库连接成功')
        // 监听 http 请求
        app.listen(8888)
    }
})

// 首页
/*app.get("/",function(req, res, next){
    // res.send("<h1>Loading 的博客</h1>")
//
    res.render('index')
})*/

