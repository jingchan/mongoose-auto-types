var exports = module.exports = lastModifiedPlugin;

function lastModifiedPlugin(schema, options){
  schema.add({ lastModified: Date });
  
  schema.pre('save', function(next){
    this.lastModified = new Date;
    next();
  });
  
  if(options && options.index){
    schema.path('lastModified').index(options.index)
  }
}
