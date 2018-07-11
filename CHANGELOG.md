# 5.0.21
__added__
- Added unit tests
- Added outdated bridge warning in popup
__fixed__
- selectAccount button click
- smartfees detectWorking argument

# 5.0.20
__added__
- Added firmware check against CoinInfo.support values
- Added outdated firmware warning in popup
__fixed__
- Fixed `TrezorConnect.requestLogin` parameters
- Fixed race condition in UI.REQUEST_CONFIRMATION
- Fixed popup.html buttons click


# 5.0.18
__added__
- Added iframe lazy loading
__fixed__
- Build script for npm module
- Ultimate flow type
- Reorganized files and imports
- Minor fixes in code

# 5.0.17
__added__
- Added `TrezorConnect.getAccountInfo` method
- Added `TrezorConnect.signTransaction` method
- Added `TrezorConnect.composeTransaction` method
- Added `TrezorConnect.signMessage` method
- Added `TrezorConnect.verifyMessage` method
- Added `TrezorConnect.getAddress` method
- Added `TrezorConnect.requestLogin` method
- Added cashaddr support for BCH
- Added documentation
__fixed__
- Fixed `TrezorConnect.customMessage` logic and security
- Fixed `TrezorConnect.stellarSignTransaction` parameters compatible with "js-stellar-base"
- Fixed flowtype declarations for all methods. Params and responses
__removed__
- Removed unnecessary settings from ConnectSettings
- Removed unused methods from TrezorConnect

# 5.0.16
__added__
- Added `TrezorConnect.stellarSignTransaction` method
__changed__
- Changed `TrezorConnect.ethereumSignTransaction` parameters
__removed__
- Removed type and event fields from RESPONSE

# 5.0.15
__fixed__
- Library exports

# 5.0.14
__added__
- Added `TrezorConnect.nemGetAddress` method
- Added `TrezorConnect.nemSignTransaction` method
- Added `TrezorConnect.stellarGetAddress` method
- Added `TrezorConnect.customMessage` method
__fixed__
- Fixed flowtype


# 5.0.13
__added__
- Added messages from json instead of config_signed.bin
- Added popup.html UI/css
- Karma + Jasmine tests
__fixed__
__removed__
- Removed support for Bridge v1 and chrome extension


# 5.0.10
From this version trezor-connect is used by Trezor Password Manager
