// var mongoose = require('mongoose');
// var ShortId = require('./shortid');
// var async = require('async');
var generateString = require('./generateString');

module.exports = exports = function shortIdPlugin(schema, options){
	schema.add({shortId: String})
	var that = this;
	schema.pre('save', function(next){
		generateString(options, function(err, res){
			that.shortId = res;
			next();	
		})
	})
}