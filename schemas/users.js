/**
 * Created by shilei on 2017/9/24.
 */

var mongoose = require('mongoose')

module.exports = new mongoose.Schema({

    username: String,
    password: String,
    isAdmin: {
        type:Boolean,
        default:false
    }
})