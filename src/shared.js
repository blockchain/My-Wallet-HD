var satoshi = 100000000; //One satoshi
var symbol_btc = {code : "BTC", symbol : "BTC", name : "Bitcoin",  conversion : satoshi, symbolAppearsAfter : true, local : false}; //Default BTC Currency Symbol object
var symbol_local = {"conversion":0,"symbol":"$","name":"U.S. dollar","symbolAppearsAfter":false,"local":true,"code":"USD"}; //Users local currency object
var symbol = symbol_btc; //Active currency object
var resource = 'Resources/';
var war_checksum;
var min = true; //whether to load minified scripts
var APP_VERSION = '3.0'; //Need some way to set this dynamically
var APP_NAME = 'javascript_web';
var IMPORTED_APP_NAME = 'external'; //Need some way to set this dynamically
var IMPORTED_APP_VERSION = '0';

module.exports = {
  APP_NAME: 'javascript_web',
  APP_VERSION: '3.0',
  getBTCSymbol: getBTCSymbol,
  getLocalSymbol: getLocalSymbol,
  satoshi: satoshi,
  setLocalSymbol: setLocalSymbol,
  setBTCSymbol: setBTCSymbol,
  playSound: playSound,
  sShift: sShift,
  BlockFromJSON: BlockFromJSON
};

function myprint (x) {console.log(x);}

function setLocalSymbol(new_symbol) {
  if (!new_symbol) return;

  if (symbol === symbol_local) {
    symbol_local = new_symbol;
    symbol = symbol_local;
  } else {
    symbol_local = new_symbol;
  }
}

function getLocalSymbol() {
  return symbol_local;
}

function setBTCSymbol(new_symbol) {
  if (!new_symbol) return;

  if (symbol === symbol_btc) {
    symbol_btc = new_symbol;
    symbol = symbol_btc;
  } else {
    symbol_btc = new_symbol;
  }
}

function getBTCSymbol() {
  return symbol_btc;
}
// used iOS
var _sounds = {};
function playSound(id) {
  try {
    if (!_sounds[id])
      _sounds[id] = new Audio('/'+resource+id+'.wav');

    _sounds[id].play();
  } catch (e) { }
}

//Ignore Console
try {
  if (!window.console) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
                 "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i) {
      window.console[names[i]] = function() {};
    }
  }
} catch (e) {
}
//The current 'shift' value - BTC = 1, mBTC = 3, uBTC = 6
function sShift(symbol) {
  return (satoshi / symbol.conversion).toString().length-1;
}

function BlockFromJSON(json) {
  return {
    hash : json.hash,
    time : json.time,
    blockIndex : json.blockIndex,
    height : json.height,
    txIndex : json.txIndexes,
    totalBTCSent : json.totalBTCSent,
    foundBy : json.foundBy,
    size : json.size
  };
}

function formatSatoshi(value, shift, no_comma) {
  if (!value)
    return '0.00';

  var neg = '';
  if (value < 0) {
    value = -value;
    neg = '-';
  }

  if (!shift) shift = 0;

  value = ''+parseInt(value);

  //TODO Clean this up
  var integerPart = (value.length > (8-shift) ? value.substr(0, value.length-(8-shift)) : '0');

  if (!no_comma) integerPart = integerPart.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

  var decimalPart = value.length > (8-shift) ? value.substr(value.length-(8-shift)) : value;

  if (decimalPart && decimalPart != 0) {
    while (decimalPart.length < (8-shift)) decimalPart = "0"+decimalPart;
    decimalPart = decimalPart.replace(/0*$/, '');
    while (decimalPart.length < 2) decimalPart += "0";

    return neg + integerPart+"."+decimalPart;
  }

  return neg + integerPart;
}

function convert(x, conversion) {
  return (x / conversion).toFixed(2).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}
