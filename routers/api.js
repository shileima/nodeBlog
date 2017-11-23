/**
 * Created by shilei on 2017/9/23.
 */

var express = require('express');

var router = express.Router();

var User = require('../models/User')
var Content = require('../models/Contents')

var responseData;

router.use(function(req,res,next){
    responseData = {
        code : 0,
        message : ''
    }
    next()
})

// 注册
router.post('/user/register',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if(username == '')
    {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData)
        return
    }

    if(password == '')
    {
        responseData.code = 2;
        responseData.message = '密不能为空';
        res.json(responseData)
        return
    }
    if(password != repassword)
    {
        responseData.code = 3;
        responseData.message = '两次输入密码不一致';
        res.json(responseData)
        return
    }

    User.findOne({
        username: username
    }).then(function(userInfo){
        if(userInfo){
            responseData.code = 4;
            responseData.message = '用户名已经被注册了'
            res.json(responseData)
            return;
        }

        var user = new User({
            username: username,
            password: password
        });

        return user.save();

    }).then(function(newUserInfo){

        //注册后，讲返回的新用户数据保存到 cookies中，直接登录
        req.cookies.set('userInfo',JSON.stringify({
            _id: newUserInfo._id,
            username: newUserInfo.username
        }));

        // console.log(newUserInfo)
        responseData.message = '注册成功!'
        res.json(responseData)
    })

})

// 登录
router.post('/user/login',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;

    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空！'
        res.json(responseData);
        return;
    }
    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码不正确！'
            res.json(responseData);
            return;
        }

        responseData.message = '登陆成功！'
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        }

        req.cookies.set('userInfo',JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
        return;

    })
})

// 退出
router.get('/user/logout', function(req,res,next){
    req.cookies.set('userInfo',null)
    res.json(responseData);
})

// 评论
router.post('/comments/post',function(req,res){
    var contentId = req.body.contentid || '';
    var reviewData = {
        postUser: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    }
    Content.findOne({_id:contentId}).then(function(content){
        content.comments.push(reviewData)
        return content.save()
    }).then(function(newContent){
        responseData.message = '评论成功！'; // responseData 是具有全局性的返回数据，默认是 code：0，message：‘’；
        responseData.data = newContent; // 将拿到的最新数据放入全局的 responseData 对象中 予以返回
        res.json(responseData)
    })
})

router.get('/comments',function(req,res){
    var contentId = req.query.contentid || '';
    Content.findOne({_id:contentId}).then(function(content){
        responseData.data = content.comments.reverse();
        res.json(responseData)

    })
})

module.exports = router;
