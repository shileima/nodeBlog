/**
 * Created by shilei on 2017/9/23.
 */

var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Contents')

router.get('/',function(req,res,next){

    var data = {
        page: Number(req.query.page || 1),
        limit: 4,
        pages: 0,
        count:0,
        category: req.query.category || '',
        categories: [],
        contents:[],
        userInfo: req.userInfo
    }

    var where = {};
    if(data.category){
        where.category = data.category
    }

    Category.find().sort({_id:-1}).then(function(categories){
        data.categories = categories
        return Content.where(where).count();
    }).then(function(count){
        data.count = count;

        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages
        data.page = Math.min( data.page, data.pages );
        //取值不能小于1
        data.page = Math.max( data.page, 1 );

        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        })
    }).then(function(contents){
        data.contents = contents;
        res.render('main/index', data)
    })
})

//文章详情页
router.get('/view',function(req,res){
    var contentId = req.query.contentid || '';
    var categories = [];
    Category.find().sort({_id:-1}).then(function(category){
        categories = category;
        return Content.findOne({
            _id:contentId
        }).populate('user')
    }).then(function(rs){
        rs.views++;
        rs.save();
        res.render('main/view.html',{
            userInfo:req.userInfo,
            content:rs,
            categories:categories
        })
    })
})

module.exports = router;