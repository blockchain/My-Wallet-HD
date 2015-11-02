'use strict';

module.exports = Tx;
////////////////////////////////////////////////////////////////////////////////
var Helpers     = require('./helpers');
var MyWallet    = require('./wallet');
var WalletStore = require('./wallet-store');
////////////////////////////////////////////////////////////////////////////////
function Tx(object){
  var obj = object || {};
  // original properties
  this.balance          = obj.balance;
  this.block_height     = obj.block_height;
  this.hash             = obj.hash;
  this.inputs           = obj.inputs || [];
  this.lock_time        = obj.lock_time;
  this.out              = obj.out  || [];
  this.relayed_by       = obj.relayed_by;
  this.result           = obj.result;
  this.size             = obj.size;
  this.time             = obj.time;
  this.tx_index         = obj.tx_index;
  this.ver              = obj.ver;
  this.vin_sz           = obj.vin_sz;
  this.vout_sz          = obj.vout_sz;
  this.double_spend     = obj.double_spend;
  this.publicNote       = obj.note;
  this.note             = MyWallet.wallet.getNote(this.hash);
  // computed properties
  this._processed_ins    = this.inputs.map(tagCoin.compose(unpackInput));
  this._processed_outs   = this.out.map(tagCoin);
}

Object.defineProperties(Tx.prototype, {
  "confirmations": {
    configurable: false,
    get: function() {
      var lastBlock = WalletStore.getLatestBlock();
      var conf = 0;
      if (lastBlock && this.block_height != null && this.block_height > 0) {
        conf = lastBlock.height - this.block_height + 1;
      }
      return conf;
    }
  },
  "processedInputs": {
    configurable: false,
    get: function() { return this._processed_ins.map(function(x){return x;});}
  },
  "processedOutputs": {
    configurable: false,
    get: function() { return this._processed_outs.map(function(x){return x;});}
  },
  "totalIn": {
    configurable: false,
    get: function() {
      return this._processed_ins.map(function(x){return x.amount;})
                                 .reduce(Helpers.add, 0);
    }
  },
  "totalOut": {
    configurable: false,
    get: function() {
      return this._processed_outs.map(function(x){return x.amount;})
                                 .reduce(Helpers.add, 0);
    }
  },
  "fee": {
    configurable: false,
    get: function() {
      return this.totalIn - this.totalOut;
    }
  },
  "internalSpend": {
    configurable: false,
    get: function() {
      return this._processed_ins.filter(function(i){ return i.coinType !== 'external';})
                                .map(function(i){return i.amount})
                                .reduce(Helpers.add, 0);
    }
  },
  "internalReceive": {
    configurable: false,
    get: function() {
      return this._processed_outs.filter(function(i){ return i.coinType !== 'external';})
                                 .map(function(i){return i.amount})
                                 .reduce(Helpers.add, 0);
    }
  },
  "amount": {
    configurable: false,
    get: function() {
      var am = 0;
      switch (this.txType) {
        case "transfer":
          am = this.internalReceive - this.changeAmount;
          break;
        case "sent":
          am = this.internalReceive - this.internalSpend;
          break;
        case "received":
          am = this.internalReceive - this.internalSpend;
          break;
        default:
          am = this.result;
      }
      return am;
    }
  },
  "changeAmount": {
    configurable: false,
    get: function() {
      return this._processed_outs.filter(function(i){ return (i.coinType !== 'external') && (i.change === true);})
                                 .map(function(i){return i.amount})
                                 .reduce(Helpers.add, 0);
    }
  },
  "txType": {
    configurable: false,
    get: function() {
      var v = null;
      var impactNoFee = this.result + this.fee
      switch (true) {
        case impactNoFee === 0:
          v = "transfer"
          break;
        case impactNoFee < 0:
          v = "sent"
          break;
        case impactNoFee > 0:
          v = "received"
          break;
        default:
          v = "complex"
      }
      return v;
    }
  }
});

function isAccount(x) {
  if (x.xpub) { return true;}
  else {return false;}
};

function isLegacy(x) {
  return MyWallet.wallet.containsLegacyAddress(x.addr);
};

function isInternal(x) {
  return (isAccount(x) || isLegacy(x));
};

function isAccountChange(x) {
  return (isAccount(x) && x.xpub.path.split('/')[1] === '1');
};

function accountPath(x){
  var accIdx = MyWallet.wallet.hdwallet.account(x.xpub.m).index;
  return accIdx + x.xpub.path.substr(1);
};

function tagCoin(x) {
  var ad = x.addr;
  var am = x.value;
  var coinType = null;
  var change = false;

  switch (true) {
    case isLegacy(x):
      coinType = "legacy";
      break;
    case isAccount(x):
      coinType = accountPath(x);
      change = isAccountChange(x);
      break;
    default:
      coinType = "external";
  }
  return {address: ad, amount: am, coinType: coinType, change: change};
};

function unpackInput(input) {
  return input.prev_out;
};

Tx.factory = function(o){
  if (o instanceof Object && !(o instanceof Tx)) {
    return new Tx(o);
  }
  else { return o; };
};
