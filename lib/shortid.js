var generateString = require('./generateString');

var exports = module.exports = shortIdPlugin

function shortIdPlugin(schema, options){
  options = options || {};
  options.fieldName = options.fieldName || 'shortId';
  var schemaDesc = {};
  schemaDesc[options.fieldName] = {
    type: String,
    required: true,
    index: { unique: true }
  };

  schema.add(schemaDesc)

  // Create new string
  schema.pre('validate', function(next){
    var doc = this;
    
    // If no shortId, generate one
    if(!this[options.fieldName]){
      var that = this;
      generateString(options, function(err, res){
        that[options.fieldName] = res;
      })
    }
    next();
  })

  if(options && options.index){
    schema.path(options.fieldName).index(options.index)
  }
}