/**
 * Created by shilei on 2017/9/24.
 */

var mongoose = require('mongoose')

module.exports = new mongoose.Schema({

    //所属分类是一个关联字段，要存储引用类型
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    title: String,
    addTime: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    comments: {
        type: Array,
        default: []
    }
})
