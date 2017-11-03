'use strict';

window.addEventListener('load', function() {
    initTrezor();
    initExample();
});

function initTrezor() {

    Trezor.on('DEVICE_EVENT', function(event) {
        switch (event.type) {
            case 'device-connect' :
            case 'device-connect_unacquired' :
                onDeviceConnect(event.data);
            break;
            case 'device-disconnect' :
            case 'device-disconnect_unacquired' :
                onDeviceDisconnect(event.data);
            break;
            case 'device-used_elsewhere':
                onDeviceUsedElsewhere(event.data);
            break;
        }
    });

    function handleDeviceConnect(device) {
        if (!device.isUsedElsewhere) {

            //Trezor.off('device-connect', handleDeviceConnect);

            console.log("AAAA", device)
            // TODO: make sure that it's called only once
            Trezor.accountDiscovery({
                //selectedDevice: _selectedDevice,
                selectedDevice: device.path,
                onStart: onAccountDiscoveryStart,
                onUpdate: onAccountDiscoveryUpdate,
                onComplete: onAccountDiscoveryComplete,
                coin: 'test'
            })
            .then(onDiscoveryComplete)
            .catch(function(e){
                console.log("Error", e);
            });
        }
    }

    Trezor.on('device-connect2', handleDeviceConnect);

    Trezor.on('device-disconnect', function(device) {
        console.log("DISCONNECT", device)
    });

    Trezor.on('UI_EVENT', function(type, data) {
        // @see: example-npm-modal.js
        handleModalEvent(type, data);
    });

    Trezor.init()
    .then(() => {
        console.log("Trezor inited")
    })
    .catch(function(error){
        console.log("Error", error);
    });
}

function onDiscoveryComplete(){
    console.warn("onDiscoveryComplete")
    // setTimeout(function(){
    //     Trezor.accountDiscovery({
    //         //selectedDevice: _selectedDevice,
    //         onStart: onAccountDiscoveryStart,
    //         onUpdate: onAccountDiscoveryUpdate,
    //         onComplete: onAccountDiscoveryComplete,
    //         coin: 'Testnet'
    //     })
    //     .then( function(){
    //         // another discovery with different coin
    //     })
    //     .catch(function(e){
    //         console.log("Error", e);
    //     });
    // }, 1000);
}

function onAccountDiscoveryStart(account, allAccounts) {
    console.log("onAccountDiscoveryStart", account)

    var container = document.getElementById('accounts-container');

    var accountLabel = 'Account #' + (account.id + 1);
    if (!account.segwit) {
        accountLabel = 'Legacy Account #' + (account.id + 1);
    }

    var newDiv = document.createElement("div");
    newDiv.className = 'account-item';
    newDiv.setAttribute("data-xpub", account.xpub);
    newDiv.innerHTML = '<div>' + accountLabel +'</div><div>Loading...</div>';
    container.appendChild(newDiv);
}

function onAccountDiscoveryUpdate(account, allAccounts) {
    // set monitor
    account.setAccountMonitorListener(onAccountBalanceUpdate);
    onAccountBalanceUpdate(account);
}

function onAccountDiscoveryComplete(accounts) {
    console.log("onAccountDiscoveryComplete", accounts)
}

function onAccountBalanceUpdate(account){
    console.log("---onAccountBalanceUpdate", account)

    var accountLabel = 'Account #' + (account.id + 1);
    if (!account.segwit) {
        accountLabel = 'Legacy Account #' + (account.id + 1);
    }
    var coin = account.backend.coinInfo.shortcut;

    var div = document.querySelectorAll("[data-xpub='" + account.xpub + "']")[0];
    div.innerHTML = '<div>' + accountLabel +'</div><div>' + account.getBalance() + ' ' + coin + '</div>';
}

function handleResponse(response){
    var resp = document.getElementById('response');
    if(response === undefined){
        console.error("Undefined response");
        return;
    }
    resp.innerHTML = jsonPrettyPrint.toHtml(response);
    console.log(response);
}



function initExample() {

    redrawNavigation();

    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', handleButtonClick);
    }

    var logo = 'https://aurumpay.com/assets/img/logo.png';
    var resp = document.getElementById('response');


    function handleButtonClick(event){

        var buttonId = event.currentTarget.id.split('-');
        var method = buttonId[0];
        var containerType = buttonId[1]; // popup || modal
        var description = "m/44'/0'/0'";
        var firmware = "1.3.4";

        switch (method) {
            case 'getPublicKey':
                Trezor.getPublicKey({
                    //selectedDevice: _selectedDevice,
                    confirmation: false,
                    //account: 0,
                    coin: 'Bitcoin'
                })
                .then(handleResponse)
                .catch(function(e){
                    console.log("E!", e);
                });
            break;
        }
    }

}



