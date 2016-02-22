'use strict';

module.exports = new RNG();

var randomBytes = require('randombytes');
var API         = require('./api');
var Buffer      = require('buffer').Buffer;
var assert      = require('assert');
var Helpers     = require('./helpers');

function RNG() {
  this.ACTION    = 'GET';
  this.URL       = 'https://api.blockchain.info/v2/randombytes';
  this.FORMAT    = 'hex';  // raw, hex, base64
  this.BYTES     = 32;
}


// xor :: Buffer -> Buffer -> Buffer
RNG.prototype.xor = function (a, b) {
  assert(
    Buffer.isBuffer(a) && Buffer.isBuffer(b),
    'Expected arguments to be buffers'
  );

  var length = Math.min(a.length, b.length);
  var buffer = new Buffer(length);

  for (var i = 0; i < length; ++i) {
    buffer[i] = a[i] ^ b[i];
  }

  return buffer;
};

// run :: Int -> Buffer
RNG.prototype.run = function (nBytes) {
  try {
    nBytes = Helpers.isPositiveInteger(nBytes) ? nBytes : this.BYTES;
    var serverH = this.getServerEntropy(nBytes);
    var localH = randomBytes(nBytes);
    var combinedH = this.xor(localH, serverH);

    assert(
      !Array.prototype.every.call(serverH, function (b) { return b === serverH[0] }),
      'The server entropy should not be the same byte repeated.'
    );
    assert(
      !Array.prototype.every.call(localH, function (b) { return b === localH[0] }),
      'The browser entropy should not be the same byte repeated.'
    );
    assert(
      serverH.byteLength === localH.byteLength,
      'Both entropies should be same of the length.'
    );
    assert(
      !Array.prototype.every.call(combinedH, function (b) { return b === combinedH[0] }),
      'The combined entropy should not be the same byte repeated.'
    );
    assert(
      combinedH.byteLength === nBytes,
      'Combined entropy should be of requested length.'
    );

    return combinedH;

  } catch (e) {
    console.log('Error: RNG.run');
    console.log(e);
    throw 'Error generating the entropy';
  }
};

// getServerEntropy :: int -> Buffer
RNG.prototype.getServerEntropy = function (nBytes) {
  assert(
    this.FORMAT === 'hex',
    'Only supported hex format.'
  );

  nBytes = Helpers.isPositiveInteger(nBytes) ? nBytes : this.BYTES;
  var request = new XMLHttpRequest();
  var data = { bytes: nBytes, format: this.FORMAT };
  var url = this.URL + '?' + API.encodeFormData(data);

  request.open(this.ACTION, url, false);
  request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  request.send(null);

  if (request.status === 200) {
    assert(
      Helpers.isHex(request.responseText),
      'Non-hex server entropy answer.'
    );

    var B = new Buffer(request.responseText, this.FORMAT);

    assert(
      B.byteLength === nBytes,
      'Different entropy length requested.'
    );

    return B;
  }
  else {
    throw 'Received not ok status: ' + request.status;
  }
};
