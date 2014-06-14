var async = require('async'),
  mongoose = require('mongoose'),
  dateCreatedPlugin = require('..').DateCreated,
  conn;

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('date_created', function () {

  before(function (done) {
    conn = mongoose.createConnection('mongodb://localhost/mongoose-date-created-test');
    conn.on('error', console.error.bind(console));
    conn.once('open', function () {
      done();
    });
  });

  after(function (done) {
    conn.db.executeDbCommand({ dropDatabase: 1 }, function () {
      conn.close(done);
    });
  });

  describe('save', function(){
    var tests;
    var testRuns = 10;

    beforeEach(function(done){
      var testSchema = new mongoose.Schema();
      testSchema.plugin(dateCreatedPlugin);
      var Test = conn.model('Test', testSchema);
      
      tests = [];
      for(var i=0; i<testRuns; i++){
        tests.push(new Test());
      }
      done();
    });

    afterEach(function (done) {
      conn.model('Test').collection.drop(function(){
        delete conn.models.Test;
        done();
      })
    });

    it('should add a the dateCreated field on save', function (done) {
      async.map(tests, 
        function(el, cb){
          el.save(function(err){
            if(err) throw err;
            cb(null, el);
          });
        }, 
        function(err, res){
          should.not.exist(err);
          for(var i=0; i<res.length; i++){
            res[i].should.have.property('dateCreated');
          }
          done();
        }
      );
    });

    it('should update dateCreated after a second save', function (done) {
      async.map(tests, 
        function(el, cb){
          el.save(function(err){
            if(err) throw err;
            el.firstTime = el.dateCreated;
            el.save(function(err){
              el.secondTime = el.dateCreated;
              cb(null, el);
            });
          });
        }, 
        function(err, res){
          should.not.exist(err);
          for(var i=0; i<res.length; i++){
            res[i].firstTime.should.equal(res[i].secondTime);
          }
          done();
        }
      );
    });

  })

  describe('index option', function(){
    var tests;
    var testRuns = 10;
    var Test;
    var testSchema;

    afterEach(function (done) {
      conn.model('Test').collection.drop(function(){
        delete conn.models.Test;
        done();
      })
    });

    it('should be an index if options.index = true', function (done) {
      testSchema = new mongoose.Schema();
      testSchema.plugin(dateCreatedPlugin, {index: true});
      Test = conn.model('Test', testSchema);
      
      tests = [];
      for(var i=0; i<testRuns; i++){
        tests.push(new Test());
      }

      // Perhaps there's a better way to check for index existance
      expect(testSchema.indexes()[0][0]['dateCreated']).to.exist;
      done();
    });

    it('should not be an index if options.index = false', function (done) {
      testSchema = new mongoose.Schema();
      testSchema.plugin(dateCreatedPlugin, {index: false});
      Test = conn.model('Test', testSchema);
      
      tests = [];
      for(var i=0; i<testRuns; i++){
        tests.push(new Test());
      }

      // Perhaps there's a better way to check for index existance
      expect(testSchema.indexes()).to.be.empty;
      done();
    });
  }); 
})