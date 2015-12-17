'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
       userId: { type: String, index: true },
       borrowUserId: { type: String, index: true },
       borrowUserName: String,
       borrowApproved: Boolean,
       title: String,
       author: String,
       imgUrl: String
});

module.exports = mongoose.model('Book', Book);
