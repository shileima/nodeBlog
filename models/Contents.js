/**
 * Created by shilei on 2017/9/24.
 */

var mongoose = require('mongoose')

var contentsSchema = require('../schemas/contents')

module.exports = mongoose.model('Content',contentsSchema)