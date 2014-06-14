var async = require('async'),
  should = require('chai').should(),
  mongoose = require('mongoose'),
  shortIdPlugin = require('..').ShortId,
  conn;

describe('mongoose-shortid', function () {
  before(function (done) {
    conn = mongoose.createConnection('mongodb://localhost/mongoose-shortid-test');
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

  describe('save', function () {
    afterEach(function (done) {
      try {
        conn.model('Test').collection.drop(function(){
          delete conn.models.Test;
          done();
        })
      } catch (err) {
        console.log("AfterEach Error:", err);
        done();
      }
    });

    it('should add a the shortId field on save', function (done) {
      var testSchema = new mongoose.Schema();
      testSchema.plugin(shortIdPlugin);

      var Test = conn.model('Test', testSchema);
      var test1 = new Test();
      var test2 = new Test();

      async.series({
        test1: function(cb){
          test1.save(cb);
        },
        test2: function(cb){
          test2.save(cb);
        }
      }, function(err, res){
        should.not.exist(err);
        res.test1[0].should.have.property('shortId');
        res.test2[0].should.have.property('shortId');
        done();
      })

    });

    it('should generate fields of custom length', function (done) {
      var testSchema = new mongoose.Schema();
      var customLength = 3;
      testSchema.plugin(shortIdPlugin, {length: customLength});

      var Test = conn.model('Test', testSchema);
      var test1 = new Test();
      var test2 = new Test();

      async.series({
        test1: function(cb){
          test1.save(cb);
        },
        test2: function(cb){
          test2.save(cb);
        }
      }, function(err, res){
        should.not.exist(err);
        res.test1[0].shortId.length.should.equal(customLength);
        res.test2[0].shortId.length.should.equal(customLength);
        done();
      })
    });

    it('should generate many unique shortIds', function (done) {
      var testSchema = new mongoose.Schema();
      testSchema.plugin(shortIdPlugin);

      var Test = conn.model('Test', testSchema);

      // Very low chance of collision with 100 runs with default length (10)
      var testRuns = 100;
      var test = [];

      for(var i=0; i<testRuns; i++){
        test.push(new Test());
      }

      async.map(test, function(el, cb){
        el.save(cb);
      }, function(err, res){
        should.not.exist(err);
        for(var i=0; i<res.length; i++){
          res[i].should.have.property('shortId');
        }
        done();
      })
    });

    it('should throw error if creating duplicate shortIds', function (done) {
      var testSchema = new mongoose.Schema();

      // Constrain length to 1, ensuring duplicate will occur
      testSchema.plugin(shortIdPlugin, {length: 1});

      var Test = conn.model('Test', testSchema);

      var testRuns = 100;
      var test = [];

      for(var i=0; i<testRuns; i++){
        test.push(new Test());
      }

      async.map(test, function(el, cb){
        el.save(cb);
      }, function(err, res){
        should.exist(err);

        // Ensure is correct error message
        err.name.should.equal('MongoError');
        err.code.should.equal(11000); // Duplicates

        done();
      })
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

    it('should default to the \'shortId\' field', function (done) {
      testSchema = new mongoose.Schema();
      testSchema.plugin(shortIdPlugin);
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
            res[i].should.have.property('shortId');
          }
          done();
        }
      );
    });

    it('should be able to use custom fieldName', function (done) {
      testSchema = new mongoose.Schema();
      testSchema.plugin(shortIdPlugin, {fieldName: 'testFieldName'});
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
            res[i].should.not.have.property('shortId');
            res[i].should.have.property('testFieldName');
          }
          done();
        }
      );
    });
  }); 
})