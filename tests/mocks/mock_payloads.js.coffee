root = global

# Using the same seed and passphrase for two wallets: one without and one with a second password.
root.seed = "032e2c7c11329737f4b8d1b9076044ed"
root.passphrase = "add imitate business carbon city orbit spray boss ribbon deposit bachelor sustain"
root.bip39Password = null

root.second_password = "1234"
# Generated with: WalletCrypto.encryptSecretWithSecondPassword("032e2c7c11329737f4b8d1b9076044ed", "1234", "87654321-4321-4321-4321-ba0987654321", 1)
root.seed_encrypted = "no6CHilGTEALs4+mBEV2GdKGar1q+3ul4paMYr4kGmRPHmqrjPCU2fx+KYJ4FgBO0gZyu9+IhXBR4jmNlqQ2CQ=="

root.xpubAccountZero  = "xpub6CcRcFnKD32pPkjV8sVNG4WejGQwQTCaAs31e3NoaFSSnYWfBuEWNo3nKWVZotgtN1dpoYGwSxUVyVfNrrgE7YwpSrUWsqgK2LdmuGDCBMp"
root.xprivAccountZero = "xprv9yd5CkFRNfUXBGf22qxMtvZvBEaSzzUioe7QqeyC1uuTukBWeMvFpzjJUEDswuWby8JmGR84wQHy75djYEAsAktvJa5B2QueQkzuNQiqS1C"

root.decryptedWalletPayload = {
	"guid" :      "12345678-1234-1234-1234-1234567890ab",
	"sharedKey" : "87654321-4321-4321-4321-ba0987654321",
	"options" : {
    "pbkdf2_iterations":1,
    "fee_per_kb":10000,
    "html5_notifications":false,
    "logout_time":600000,
    "tx_display":0,
    "always_keep_local_backup":false,
    "transactions_per_page":30,
    "additional_seeds":[]
  },
	"keys" : [
    {"addr":"1M6QyoUiC6Zb1magk2xv2BUg9E6qT1vCAr","label":"Legacy address 1","priv":"G2yMnCQuT5srRmR1rvUzRr9xzTPWGmcN5T2XjarfRdCH","created_time":0,"created_device_name":"external","created_device_version":"0"}
	],
	"address_book" : [
	  {"addr" : "1C26NBkFUc2Et2Ghf3mwPtKYFm2MqGvC7q", "label" : "Friend 1"}
	],
	"tx_notes" : {"9cfb4c8a92ad1ce0ac464132b270f3bb691587f923f48e3bbdf32736d8359309":"Test note","f5c59046e58826ee77ab281c4994b7d7f55bff311ed89fc18cf0b2daae73a90b":"Wow","2e56a0fdcc8567083abb1385c48e0b59f6fc5e6005533c6b49c22932281f87bd":"Flaa   f","3ade266d618ed2c5ab6dfdc1f6c71bad29afd155c1ea48fdef26233a772ca4d5":"AB","2a639e2e927a7d62854d492734cf450d6d07c1779dc6fbe0b763103275bb2d74":"Sent to other wallet","aba107861882b781b433141e1fa5e63312387eb228adcf519d70933440c19de5":"a","af3282da9abfae94573cb0493d59ba15882535b63e04da32c6110b40e8171b82":"Bllll","a44751173217cb0f547176a7e0c5b973548ede1dabfdd65a9e0d6de11e70c3ca":"Bla tea"},
	"hd_wallets" : [
	  {
      "seed_hex" : root.seed,
      "mnemonic_verified" : "false",
      "default_account_idx" : "0",
    	"accounts" : [
        {
          "label":"Checking",
          "archived":false,
          "change_addresses":3,
          "xpriv":root.xprivAccountZero,
          "xpub":root.xpubAccountZero
        }
        {
          "label":"Savings",
          "archived":false,
          "change_addresses":0,
          "xpriv":"xprvA13yegr3foPWNkJhJdAQMCAHKuB1BGDSFLTcZSDHkaC89MjKPscWdjMro5HEqB7VYgX88wHff3JEnD2s4DXsM6ZJNi8aX91igFXKcx4t9ga",
          "xpub":"xpub6E3L4CNwWAwobEPAQehQiL71sw1VaiwHcZPDMpcuJuj72A4TwQvmBXgLeKo1NA1WA74XzDmR1vmYF1veqLwMqQYNg1Azv1wxv3yJeVBpxJa"
        }
    	]
  	}
	]
}

root.decryptedWalletWithSecondPasswordPayload = {
	"guid" :      "12345678-1234-1234-1234-1234567890ab",
	"sharedKey" : "87654321-4321-4321-4321-ba0987654321",
	"options" : {
    "pbkdf2_iterations":1,
    "fee_per_kb":10000,
    "html5_notifications":false,
    "logout_time":600000,
    "tx_display":0,
    "always_keep_local_backup":false,
    "transactions_per_page":30,
    "additional_seeds":[]
    },
	"keys" : [
    {"addr":"1M6QyoUiC6Zb1magk2xv2BUg9E6qT1vCAr","label":"Legacy address 1","priv":"...","created_time":0,"created_device_name":"external","created_device_version":"0"}
	],
	"address_book" : [
	  {"addr" : "1C26NBkFUc2Et2Ghf3mwPtKYFm2MqGvC7q", "label" : "Friend 1"}
	],
	"tx_notes" : {"9cfb4c8a92ad1ce0ac464132b270f3bb691587f923f48e3bbdf32736d8359309":"Test note","f5c59046e58826ee77ab281c4994b7d7f55bff311ed89fc18cf0b2daae73a90b":"Wow","2e56a0fdcc8567083abb1385c48e0b59f6fc5e6005533c6b49c22932281f87bd":"Flaa   f","3ade266d618ed2c5ab6dfdc1f6c71bad29afd155c1ea48fdef26233a772ca4d5":"AB","2a639e2e927a7d62854d492734cf450d6d07c1779dc6fbe0b763103275bb2d74":"Sent to other wallet","aba107861882b781b433141e1fa5e63312387eb228adcf519d70933440c19de5":"a","af3282da9abfae94573cb0493d59ba15882535b63e04da32c6110b40e8171b82":"Bllll","a44751173217cb0f547176a7e0c5b973548ede1dabfdd65a9e0d6de11e70c3ca":"Bla tea"},
	"hd_wallets" : [
	  {
      "seed_hex" : "...",
      "mnemonic_verified" : "false",
      "default_account_idx" : "0",
    	"accounts" : [
        {
          "label":"Checking",
          "archived":false,
          "change_addresses":3,
          "xpriv":"EFnCSJKivjVSG0FV0fEHKZoPUwpov/vq7OW0wSS3ku9xY10awjMTT49cso2S4k5GwpuQs5HzCNkjs5yCqRTaUMvBrLMfwVbqHirMExmMFErJ8mxoHOmaDknhr6hyd2+CKy8g0Th+PhL7ZjzmHspAgdU7O8VWnBjv8i02Fo/2pT8=",
          "xpub":"xpub6F1cPTmvp4FrWUjDvtdZHJF1MVxdrx3LeSho3NFk6dKRT3x88BqcFbmitM1BuLR9b62yiNbsPHMxCVwZGFBKMzaAKVWbvVYxmXS14pCoxbJ"
        }
        {
          "label":"Savings",
          "archived":false,
          "change_addresses":0,
          "xpriv":"...",
          "xpub":root.xpubAccountZero
        }
    	]
  	}
	]
}
