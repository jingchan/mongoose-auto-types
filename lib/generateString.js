var crypto = require('crypto');

module.exports = generateString;

    
var alphabets = {
  10: "0123456789",
  16: "0123456789ABCDEF",
  32: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  36: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  62: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
};

function generateString(options, done){
  var options = options || {};
	var length = options.length || 10;
  var base = options.base || 62;
  var alphabet = alphabets[base];

  if(!alphabet) done("No appropriate alphabet found for base " + base);

  crypto.pseudoRandomBytes(length, function(err, buf) {
      if (err) {
          done(err);
      } else {
	      var out = [];
	      for(var i=0; i<length; i++){
	          out[i] = alphabet[buf[i]%alphabet.length];
	      }
	      done(null, out.join(''));
      }
  });
}


