var async = require('async'),
  mongoose = require('mongoose'),
  lastModifiedPlugin = require('..').LastModified,
  conn;

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('last_modified', function () {

  before(function (done) {
    conn = mongoose.createConnection('mongodb://localhost/mongoose-last-modified-test');
    conn.on('error', console.error.bind(console));
    conn.once('open', function () {
      done();
    });
  });

  after(function (done) {
    conn.db.command({ dropDatabase: 1 }, function () {
      conn.close(done);
    });
  });

  describe('save', function(){
    var tests;
    var testRuns = 10;

    beforeEach(function(done){
      var testSchema = new mongoose.Schema();
      testSchema.plugin(lastModifiedPlugin);
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

    it('should add a the lastModified field on save', function (done) {
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
            res[i].should.have.property('lastModified');
          }
          done();
        }
      );
    });

    it('should update lastModified after a second save', function (done) {
      async.map(tests, 
        function(el, cb){
          el.save(function(err){
            if(err) throw err;
            el.firstTime = el.lastModified;
            el.save(function(err){
              el.secondTime = el.lastModified;
              cb(null, el);
            });
          });
        }, 
        function(err, res){
          should.not.exist(err);
          for(var i=0; i<res.length; i++){
            res[i].firstTime.should.be.lessThan(res[i].secondTime);
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
      testSchema.plugin(lastModifiedPlugin, {index: true});
      Test = conn.model('Test', testSchema);
      
      tests = [];
      for(var i=0; i<testRuns; i++){
        tests.push(new Test());
      }

      // Perhaps there's a better way to check for index existance
      expect(testSchema.indexes()[0][0]['lastModified']).to.exist;
      done();
    });

    it('should not be an index if options.index = false', function (done) {
      testSchema = new mongoose.Schema();
      testSchema.plugin(lastModifiedPlugin, {index: false});
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

  describe('fieldName option', function(){
    var tests;
    var testRuns = 1;
    var Test;
    var testSchema;

    afterEach(function (done) {
      conn.model('Test').collection.drop(function(){
        delete conn.models.Test;
        done();
      })
    });

    it('should default to the \'lastModified\' field', function (done) {
      testSchema = new mongoose.Schema();
      testSchema.plugin(lastModifiedPlugin);
      Test = conn.model('Test', testSchema);
      
      tests = [];
      for(var i=0; i<testRuns; i++){
        tests.push(new Test());
      }

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
            res[i].should.have.property('lastModified');
          }
          done();
        }
      );
    });

    it('should be able to use custom fieldName', function (done) {
      testSchema = new mongoose.Schema();
      testSchema.plugin(lastModifiedPlugin, {fieldName: 'testFieldName'});
      Test = conn.model('Test', testSchema);
      
      tests = [];
      for(var i=0; i<testRuns; i++){
        tests.push(new Test());
      }

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
            res[i].should.not.have.property('lastModified');
            res[i].should.have.property('testFieldName');
          }
          done();
        }
      );
    });
  });
})