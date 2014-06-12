var generateString = require('./generateString');

var exports = module.exports = shortIdPlugin

function shortIdPlugin(schema, options){
	schema.add({shortId: String})
	var that = this;

	schema.pre('save', function(next){
		generateString(options, function(err, res){
			that.shortId = res;
			next();	
		})
	})
}