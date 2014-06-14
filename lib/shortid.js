var generateString = require('./generateString');

var exports = module.exports = shortIdPlugin

function shortIdPlugin(schema, options){
  schema.add({
    shortId: {
      type: String, 
      required: true, 
      index: { unique: true }
    } 
  })

  // Create new string
  schema.pre('validate', function(next){
    var doc = this;
    
    // If no shortId, generate one
    if(!this.shortId){
      var that = this;
      generateString(options, function(err, res){
        that.shortId = res;
        next();
      })
    }
  })

  if(options && options.index){
    schema.path('shortId').index(options.index)
  }
}