/**
 * Created by shilei on 2017/9/24.
 */

var mongoose = require('mongoose')

var categoriesSchema = require('../schemas/categories')

module.exports = mongoose.model('Category',categoriesSchema)