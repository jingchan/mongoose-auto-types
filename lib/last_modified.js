var exports = module.exports = lastModifiedPlugin;

function lastModifiedPlugin(schema, options){
  options = options || {};
  options.fieldName = options.fieldName || 'lastModified';
  var schemaDesc = {};
  schemaDesc[options.fieldName] = Date;
  schema.add(schemaDesc);
  
  schema.pre('save', function(next){
    this[options.fieldName] = new Date;
    next();
  });
  
  if(options && options.index){
    schema.path(options.fieldName).index(options.index)
  }
}
