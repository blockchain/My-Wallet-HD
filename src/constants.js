var Bitcoin = require('bitcoinjs-lib');

module.exports = {
  NETWORK: 'bitcoin',
  APP_NAME: 'javascript_web',
  APP_VERSION: '3.0',
  BITCOIN_DUST: 546,
  SHAPE_SHIFT_KEY: void 0,
  SERVER_FEE_FALLBACK: {
    'limits': {
      'min': 2,
      'max': 16
    },
    'regular': 5,
    'priority': 11
  },
  getNetwork: function (bitcoinjs) {
    if (bitcoinjs) {
      return bitcoinjs.networks[this.NETWORK];
    } else {
      return Bitcoin.networks[this.NETWORK];
    }
  },
  getDefaultWalletOptions: function () {
    return {
      pbkdf2_iterations: 5000,
      html5_notifications: false,
      fee_per_kb: 10000,
      logout_time: 600000
    };
  }
};
