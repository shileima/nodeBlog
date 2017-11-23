/**
 * Created by shilei on 2017/9/23.
 */

var express = require('express');

var router = express.Router();

var User = require('../models/User')
var Category = require('../models/Category')
var Content = require('../models/Contents')


router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        res.send('对不起，您没有进入后台的权限')
        return
    }
    next()
})
//后台首页
router.get('/',function(req,res){
    res.render('admin/index',{
        userInfo : req.userInfo
    })
})

//用户管理
router.get('/user',function(req,res){
    var page=Number(req.query.page || 1);
    var limit=5;

    User.count().then(function(count){
        pages=Math.ceil(count/limit)
        page=Math.min(page,pages)
        page=Math.max(page,1)
        var skip=(page-1)*limit
        User.find().limit(limit).skip(skip).then(function(users){
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                page:parseInt(page),
                limit:limit,
                count:count,
                pages:pages
            })
        })
    })
})

/*分类首页*/
router.get('/category',function(req,res){
    var page=Number(req.query.page || 1);
    var limit=10;

    Category.count().then(function(count){
        pages=Math.ceil(count/limit)
        page=Math.min(page,pages)
        page=Math.max(page,1)
        var skip=(page-1)*limit
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,
                page:parseInt(page),
                limit:limit,
                count:count,
                pages:pages
            })
        })
    })
})

/*分类添加*/
router.get('/category/add',function(req,res){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
})

/*分类添加保存*/
router.post('/category/add',function(req,res){
    var name = req.body.name || '';
    if(name==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message : '分类名称不能为空'
        })
        return;
    }

    Category.findOne({
        name:name
    }).then(function(rs){
        if(rs){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message : '分类名称已经存在！'
            })
            return Promise.reject() // 在 then() 函数中阻止继续执行，不能用 return false
        }else{
            return new Category({
                name:name
            }).save()
        }
    }).then(function(newCategory){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message : '保存成功！',
            url:'/admin/category'
        })
    })
})
/*分类的修改*/

router.get('/category/edit',function(req,res){
    var id = req.query.id || '';
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message : '分类名称不存在！'
            })
            return Promise.reject()
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            })
        }
    })
})
/*分类的保存*/
router.post('/category/edit',function(req,res){
    var id = req.query.id || '';
    var name = req.body.name || '';

    if(name == '')
    {
        res.render('admin/error',{
            userInfo:req.userInfo,
            message : '分类名称不能为空！'
        })
        return
    }

    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message : '分类信息不存在！'
            })
            return Promise.reject()
        }else{
            if(name==category.name){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message : '保存成功！',
                    url:'/admin/category'
                })
                return Promise.reject()
            }else {
                return Category.findOne({
                    _id: {$ne:id},
                    name:name
                })
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message : '数据库中存在同名分类！'
            })
            return Promise.reject()
        }else {
            return Category.update({
                _id:id
            },{
                name:name
            })
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message : '保存修改成功！',
            url:'/admin/category'
        })
    })
})

/*分类的删除*/
router.get('/category/delete',function(req,res){
    var id = req.query.id || '';
    Category.remove({
        _id:id
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类删除成功！',
            url: '/admin/category'
        })
    })
})

// 内容首页
router.get('/content',function(req,res){

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Content.count().then(function(count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page, pages );
        //取值不能小于1
        page = Math.max( page, 1 );

        var skip = (page - 1) * limit;

        Content.find().limit(limit).skip(skip).populate(['category', 'user']).sort({
            _id: -1
        }).then(function(contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });
    });
})

// 内容添加
router.get('/content/add',function(req,res){
    Category.find().then(function(categories){
        res.render('admin/content_add',{
            userInfo: req.userInfo,
            categories,
        })
    })
})

// 内容添加保存

router.post('/content/add',function(req,res){
    if(req.body.category==''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '分类信息不能为空'
        })
        return;
    }
    if(req.body.title==''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '标题不能为空'
        })
        return;
    }
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '内容保存成功！',
            url: '/admin/content'
        })
    })
})

//内容编辑
router.get('/content/edit',function(req,res) {
    var id = req.query.id || '';  
    var categories=[]  
    Category.find().then(function(rs){
        categories=rs
    })
    Content.findOne({
        _id:id
    }).populate('category').then(function(content){
        if(!content){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '指定内容不存在！'
            })
            return Promise.reject()
        }else{
            res.render('admin/content_edit.html',{
            userInfo: req.userInfo,
            content: content,
            categories: categories
            })
        }
        
    })  
})

// 内容编辑的保存

router.post('/content/edit',function(req,res) {
    var id = req.query.id || '';      
    if(req.body.category==''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '分类信息不能为空'
        })
        return;
    }
    if(req.body.title==''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '标题不能为空'
        })
        return;
    }

    Content.update({
        _id:id
    },{
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '修改保存成功！',
            url: '/admin/content'
        })
    })
})

//内容的删除
router.get('/content/delete',function(req,res){
    var id = req.query.id || '';

    Content.remove({
        _id:id
    }).then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '内容删除成功！',
            url: '/admin/content'
        })
    })
})

module.exports = router;