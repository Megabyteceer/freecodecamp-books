'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	
	provider:String,
	id: { type: String, index: true } ,
	displayName: String

});

module.exports = mongoose.model('User', User);
