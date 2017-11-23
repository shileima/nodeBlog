/**
 * Created by shilei on 2017/9/24.
 */

var mongoose = require('mongoose')

var userSchema = require('../schemas/users')

module.exports = mongoose.model('User',userSchema)
