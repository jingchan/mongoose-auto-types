var exports = module.exports = dateCreatedPlugin;

function dateCreatedPlugin(schema, options){
  schema.add({ dateCreated: Date });
  
  schema.pre('save', function(next){
  	if(!this.dateCreated){
      this.dateCreated = new Date;
    }
    next();
  });
  
  if(options && options.index){
    schema.path('dateCreated').index(options.index)
  }
}
