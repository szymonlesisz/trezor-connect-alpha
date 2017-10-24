// initialization

Trezor.init({
    // options
})
.catch(function(error){
    // initialization error
});

// Device Events: connect, disconnect, used_elsewhere (acquired, released)

Trezor.on('DEVICE_EVENT', function(event) {
    switch (event.type) {
        case 'device_connect' :
            onDeviceConnect(event.data);
        break;
        case 'device_disconnect' :
            onDeviceDisconnect(event.data);
        break;
        case 'device_used_elsewhere':
            onDeviceUsedElsewhere(event.data);
        break;
    }
});

// OR

Trezor.on('device_connect', function(event) {
    onDeviceConnect(event.data);
});

Trezor.on('device_disconnect', function(event) {
    onDeviceDisconnect(event.data);
});

// UI events

Trezor.on('UI_EVENT', function(type, data) {
    switch (event.type) {
        case 'ui_request_window' :
            // show modal
        break;
    }
});

// OR

Trezor.on('ui_request_window', function(type, data) {
    // show modal
    // ... opening window

    // UI response from modal
    Trezor.uiMessage({ type: 'popup_handshake' });
});






// Call method

Trezor.getPublicKey({
    account: 0,
    coin: 'Bitcoin'
})
.then(function(response) {
    // resposne
})
.catch(function(e){
   // handle error
});

