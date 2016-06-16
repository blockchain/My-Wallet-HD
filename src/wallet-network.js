'use strict';

var API = require('./api');
var Helpers = require('./helpers');
var WalletCrypto = require('./wallet-crypto');
var WalletStore = require('./wallet-store');
var MyWallet = require('./wallet');
var assert = require('assert');

function handleError (msg) {
  return function (e) {
    var errMsg = e.responseJSON && e.responseJSON.initial_error
        ? e.responseJSON.initial_error
        : e || msg;
    return Promise.reject(errMsg);
  };
}

function handleResponse (obj) {
  console.log(obj.success);
  if (obj.success) {
    return obj.message;
  } else {
    return Promise.reject(obj.message);
  }
}

function generateUUIDs (count) {
  var data = {
    format: 'json',
    n: count,
    api_code: API.API_CODE
  };

  var extractUUIDs = function (data) {
    if (!data.uuids || data.uuids.length != count) {
      return Promise.reject('Could not generate uuids');
    }
    return data.uuids;
  };

  return API.retry(API.request.bind(API, 'GET', 'uuid-generator', data))
    .then(extractUUIDs);
}

/**
 * Fetch information on wallet identfier with resend code set to true
 * @param {string} user_guid User GUID.
 * @param {string} sessionToken.
 */
// used in the frontend and in iOS
function resendTwoFactorSms (user_guid, sessionToken) {
  assert(user_guid, "wallet identifier required");
  assert(sessionToken, "Session token required");

  var data = {
    format: 'json',
    resend_code: true,
    ct: Date.now(),
    api_code: API.API_CODE
  };

  var headers = {sessionToken: sessionToken};

  return API.request('GET', 'wallet/' + user_guid, data, headers)
    .catch(handleError('Could not resend two factor sms'));
}

/**
 * Trigger an email with the users wallet guid(s)
 * @param {string} user_email Registered mail address.
 * @param {string} captcha Spam protection
 */
// used in the frontend
function recoverGuid (sessionToken, user_email, captcha) {
  var data = {
    method: 'recover-wallet',
    email: user_email,
    captcha: captcha,
    ct: Date.now(),
    api_code: API.API_CODE
  };

  var headers = {
    sessionToken: sessionToken
  };

  return API.request('POST', 'wallet', data, headers)
    .then(handleResponse).catch(handleError('Could not send recovery email'));
}

function checkWalletChecksum (payload_checksum, success, error) {
  assert(payload_checksum, 'Payload checksum missing');
  var data = {method: 'wallet.aes.json', format: 'json', checksum: payload_checksum};

  API.securePostCallbacks('wallet', data, function (obj) {
    if (!obj.payload || obj.payload == 'Not modified') {
      if (success) success();
    } else if (error) error();
  }, function () {
    if (error) error();
  });
}

/**
 * Trigger the 2FA reset process
 * @param {string} user_guid User GUID.
 * @param {string} user_email Registered email address.
 * @param {string} user_new_email Optional new email address.
 * @param {string} secret
 * @param {string} message
 * @param {string} captcha Spam protection
 */
// used in the frontend
function requestTwoFactorReset (
  sessionToken,
  user_guid,
  user_email,
  user_new_email,
  secret,
  message,
  captcha) {
  var data = {
    method: 'reset-two-factor-form',
    guid: user_guid,
    email: user_email,
    contact_email: user_new_email,
    secret_phrase: secret,
    message: message,
    kaptcha: captcha,
    ct: Date.now(),
    api_code: API.API_CODE
  };

  var headers = {
    sessionToken: sessionToken
  };

  return API.request('POST', 'wallet', data, headers)
    .then(handleResponse);
}

// Save the javascript wallet to the remote server
function insertWallet (guid, sharedKey, password, extra, decryptWalletProgress, sessionToken) {
  assert(guid, 'GUID missing');
  assert(sharedKey, 'Shared Key missing');
  assert(password, 'Password missing');

  var dataPromise = new Promise(function (resolve, reject) {
    // var data = MyWallet.makeCustomWalletJSON(null, guid, sharedKey);
    var data = JSON.stringify(MyWallet.wallet, null, 2);

    // Everything looks ok, Encrypt the JSON output
    var crypted = WalletCrypto.encryptWallet(data, password, MyWallet.wallet.defaultPbkdf2Iterations, MyWallet.wallet.isUpgradedToHD ? 3.0 : 2.0);

    if (crypted.length == 0) {
      return reject('Error encrypting the JSON output');
    }

    decryptWalletProgress && decryptWalletProgress();

    // Now Decrypt the it again to double check for any possible corruption
    try {
      WalletCrypto.decryptWalletSync(crypted, password);
    } catch (e) {
      return reject(e);
    }

    // SHA256 new_checksum verified by server in case of corruption during transit
    var new_checksum = WalletCrypto.sha256(crypted).toString('hex');

    extra = extra || {};

    var post_data = {
      length: crypted.length,
      payload: crypted,
      checksum: new_checksum,
      method: 'insert',
      format: 'plain',
      sharedKey: sharedKey,
      guid: guid
    };

    Helpers.merge(post_data, extra);
    resolve(post_data);
  });

  var apiPromise = dataPromise.then(function (postData) {
    var headers = {sessionToken: sessionToken};

    return API.securePost('wallet', postData, headers);
  });

  return Promise.all([dataPromise, apiPromise]);
}

function obtainSessionToken () {
  var processResult = function (data) {
    if (!data.token || !data.token.length) {
      return Promise.reject('Invalid session token');
    }
    return data.token;
  };

  return API.request("POST", "sessions").then(processResult);
}

function establishSession (token) {
  if(token) {
    return Promise.resolve(token);
  } else {
    return this.obtainSessionToken();
  }
}

// sharedKey is optional
// token must be present if sharedKey isn't
function callGetWalletEndpoint (guid, sharedKey, sessionToken) {
  var clientTime = (new Date()).getTime();
  var data = { format : 'json', resend_code : null, ct : clientTime, api_code : API.API_CODE };
  var headers = {}

  if (sharedKey) {
    data.sharedKey = sharedKey;
  } else {
    assert(sessionToken, "Session token required");
    headers.sessionToken = sessionToken;
  }
  return API.request('GET', 'wallet/' + guid, data, headers);
}

function fetchWallet (guid, token, needsTwoFactorCode, authorizationRequired) {
  var promise = new Promise(function (resolve, reject) {

    var success = function (obj) {
      if (!obj.guid) {
        WalletStore.sendEvent('msg', {type: 'error', message: 'Server returned null guid.'});
        reject('Server returned null guid.');
        return;
      }

      // Even if Two Factor is enabled, some settings need to be saved here,
      // because they won't be part of the 2FA response.
      WalletStore.setGuid(obj.guid);
      WalletStore.setRealAuthType(obj.real_auth_type);
      WalletStore.setSyncPubKeys(obj.sync_pubkeys);

      if (obj.payload && obj.payload.length > 0 && obj.payload != 'Not modified') {
        resolve(obj);
      } else {
        needsTwoFactorCode(obj.auth_type);
      }
    };

    var error = function (e) {
       var obj = 'object' === typeof e ? e : JSON.parse(e);
       if(obj && obj.initial_error && !obj.authorization_required) {
         reject(obj.initial_error);
         return;
       }
       if (obj.authorization_required) {
         authorizationRequired().then(function() {
           callGetWalletEndpoint(guid, null, token).then(success).catch(error);
         })
       }
    };

    callGetWalletEndpoint(guid, null, token).then(success).catch(error)
  });
  return promise;
}

function  fetchWalletWithTwoFactor (guid, sessionToken, twoFactor) {
  var promise = new Promise(function (resolve, reject) {
    if (twoFactor.code.length == 0 || twoFactor.code.length > 255) {
     reject('You must enter a Two Factor Authentication code');
     return;
    }

    var two_factor_auth_key = twoFactor.code;

    switch(twoFactor.type) {
      case 2: // email
      case 4: // sms
      case 5: // Google Auth
        two_factor_auth_key = two_factor_auth_key.toUpperCase();
      break;
    }

    var success = function (data) {
     if (data == null || data.length == 0) {
       otherError('Server Return Empty Wallet Data');
       return;
     }
     if (data != 'Not modified') { WalletStore.setEncryptedWalletData(data); }
     resolve(data);
    };
    var error = function (response) {
     WalletStore.setRestoringWallet(false);
     reject(response);
    };

    var myData = {
      guid: guid,
      payload: two_factor_auth_key,
      length : two_factor_auth_key.length,
      method : 'get-wallet',
      format : 'plain',
      api_code : API.API_CODE
    };

    var headers = {sessionToken: sessionToken};

    API.request('POST', 'wallet', myData, headers).then(success).catch(error);
  });
  return promise;
}

function fetchWalletWithSharedKey (guid, sharedKey) {

  var success = function (obj) {

    if (!obj.guid) {
      throw('Server returned null guid.');
    }

    // Even if Two Factor is enabled, some settings need to be saved here,
    // because they won't be part of the 2FA response.
    WalletStore.setGuid(obj.guid);
    WalletStore.setRealAuthType(obj.real_auth_type);
    WalletStore.setSyncPubKeys(obj.sync_pubkeys);

    if (obj.payload && obj.payload.length > 0 && obj.payload != 'Not modified') {
      resolve(obj)
    } else {
      reject("Wallet payload missing, empty or 'not modified'");
    }
  };

  var error = function (e) {
     console.log(e);
     var obj = 'object' === typeof e ? e : JSON.parse(e);
     if(obj && obj.initial_error) {
       reject(obj.initial_error);
       return;
     }

     WalletStore.sendEvent('did_fail_set_guid');
  };

  return callGetWalletEndpoint(guid, sharedKey).then(success).catch(error)
}

function pollForSessionGUID (sessionToken) {
  var promise = new Promise(function (resolve, reject) {
    if (WalletStore.isPolling()) return;
    WalletStore.setIsPolling(true);
    var data = {format : 'json'};
    var headers = {sessionToken: sessionToken};
    var success = function (obj) {
      if (obj.guid) {
        WalletStore.setIsPolling(false);
        WalletStore.sendEvent('msg', {type: 'success', message: 'Authorization Successful'});
        resolve()
      } else {
        if (WalletStore.getCounter() < 600) {
          WalletStore.incrementCounter();
          setTimeout(function () {
            API.request('GET', 'wallet/poll-for-session-guid', data, headers).then(success).catch(error);
          }, 2000);
        } else {
          WalletStore.setIsPolling(false);
        }
      }
    }
    var error = function () {
      WalletStore.setIsPolling(false);
    }
    API.request('GET', 'wallet/poll-for-session-guid', data, headers).then(success).catch(error);
  });
  return promise;
};

function getCaptchaImage () {
  var self = this;
  var promise = new Promise(function (resolve, reject) {
    self.obtainSessionToken().then(function(sessionToken) {
      var success = function(data) {
        resolve({
          image: data,
          sessionToken: sessionToken
        });
      }

      var error = function(e) {
        console.log(e);
        reject(e.initial_error);
      }

      var data = {
        timestamp: new Date().getTime()
      };

      var headers = {sessionToken: sessionToken};

      API.request('GET', 'kaptcha.jpg', data, headers).then(success).catch(error);
    });
  });
  return promise;
};


module.exports = {
  checkWalletChecksum: checkWalletChecksum,
  insertWallet: insertWallet,
  generateUUIDs: generateUUIDs,
  resendTwoFactorSms: resendTwoFactorSms,
  recoverGuid: recoverGuid,
  requestTwoFactorReset: requestTwoFactorReset,
  obtainSessionToken: obtainSessionToken,
  establishSession: establishSession,
  fetchWalletWithSharedKey : fetchWalletWithSharedKey,
  fetchWalletWithTwoFactor : fetchWalletWithTwoFactor,
  fetchWallet : fetchWallet,
  pollForSessionGUID : pollForSessionGUID,
  getCaptchaImage : getCaptchaImage
};
