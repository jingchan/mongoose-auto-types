var exports = module.exports = dateCreatedPlugin;

function dateCreatedPlugin(schema, options){
  options = options || {};
  options.fieldName = options.fieldName || 'dateCreated';
  var schemaDesc = {};
  schemaDesc[options.fieldName] = Date;

  schema.add(schemaDesc);
  
  schema.pre('save', function(next){
  	if(!this[options.fieldName]){
      this[options.fieldName] = new Date;
    }
    next();
  });
  
  if(options && options.index){
    schema.path(options.fieldName).index(options.index)
  }
}
