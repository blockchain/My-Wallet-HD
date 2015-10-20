'use strict';

module.exports = new RNG();
////////////////////////////////////////////////////////////////////////////////
var randomBytes = require('randombytes');
// var Q           = require('q');
var API         = require('./api');
var Buffer      = require('buffer').Buffer;
var assert      = require('assert');
////////////////////////////////////////////////////////////////////////////////
// API class
function RNG(){
  this.ACTION    = "GET";
  this.URL       = "https://api.blockchain.info/v2/randombytes";
  this.FORMAT    = 'hex';  // raw, hex, base64
  this.BYTES     = 32;
  }

function xor(a, b) {
  if (!Buffer.isBuffer(a)) a = new Buffer(a)
  if (!Buffer.isBuffer(b)) b = new Buffer(b)
  var res = []
  if (a.length > b.length) {
    for (var i = 0; i < b.length; i++) {
      res.push(a[i] ^ b[i])
    }
  } else {
    for (var i = 0; i < a.length; i++) {
      res.push(a[i] ^ b[i])
    }
  }
  return new Buffer(res);
}

// run :: Int -> Fun -> Buffer
RNG.prototype.run = function (sizeBytes, callback) {
  try {
    console.log("running my rng");
    var b = sizeBytes ? sizeBytes : this.BYTES;
    var serverH = this.getServerEntropy(b);
    var localH = randomBytes(b, callback);
    assert(serverH.byteLength === localH.byteLength, 'Error: both entropies should be same of the length.');
    var combinedH = xor(localH, serverH);
    var zero = new Buffer(serverH.byteLength);
    assert(Buffer.compare(combinedH, zero) !== 0, 'Error: zero array entropy not allowed.');
  } catch (e) {
    console.log("Error: RNG.run");
    console.log(e);
    throw "Error generating the entropy";
  }
  return combinedH;
};

// getServerEntropy :: int -> Buffer
RNG.prototype.getServerEntropy = function (sizeBytes) {

  var request = new XMLHttpRequest();
  var b = sizeBytes ? sizeBytes : this.BYTES;
  var data = { bytes: b, format: this.FORMAT };
  var url = this.URL +  '?' + API.encodeFormData(data);
  request.open(this.ACTION, url , false);
  request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  request.send(null);
  if (request.status === 200) {
    var B = new Buffer(request.responseText, this.FORMAT);
    return B;
  }
  else{
    throw "network connection error";
  }
}
