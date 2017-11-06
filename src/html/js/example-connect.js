'use strict';

window.addEventListener('load', function() {
    initTrezor();
    initExample();
});

function initTrezor() {

    TrezorConnect.on('error', function(data){
        console.log("[example] error", data)
        showSnackbar("Error");
    });

    // TrezorConnect.on('button', function(data){
    //     console.log("[example] button", data);
    // });


    // TrezorConnect.on('connect', onDeviceConnect);
    // TrezorConnect.on('disconnect', onDeviceDisconnect);
    // TrezorConnect.on('used_elsewhere', onDeviceUsedElsewhere);
    TrezorConnect.on('DEVICE_EVENT', function(event) {
        console.log("-----", event)
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

    TrezorConnect.init({
        iframe_src: 'iframe.html',
        //popup_src: 'popup.html',
        coins_src: 'coins.json',
        transport_config_src: 'config_signed.bin',
        firmware_releases_src: 'releases.json',
        latest_bridge_src: 'latest.txt',
        debug: false,
        notValidParam: function() { }
    })
    .catch(function(error){
        console.log("Example", error);
    });
}


function initExample() {

    redrawNavigation();

    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', handleButtonClick);
    }

    var logo = 'https://aurumpay.com/assets/img/logo.png';
    var resp = document.getElementById('response');

    function handleResponse(response){
        if(response === undefined){
            console.error("Undefined response");
            return;
        }
        resp.innerHTML = jsonPrettyPrint.toHtml(response);
        console.log(response);
    }

    function handleButtonClick(event){

        var buttonId = event.currentTarget.id.split('-');
        var method = buttonId[0];
        var containerType = buttonId[1]; // popup || modal

        switch (method) {

            case 'composeTransaction':
                TrezorConnect.composeTransaction({
                    //selectedDevice: _selectedDevice,
                    outputs: [
                        // {
                        //     address: 'moUGx4oDeQ9hNrmsX8Z1xVneDv9QAHFUrT',
                        //     //amount: 10000
                        //     //amount: 9829 - 1971
                        //     amount: 9829 - 171 - 546
                        // },
                        {
                            address: '2Mu6MwbU4eLdDbRL8fio2oyEfxfv4MKn7Rw',
                            amount: 10000
                            //address: 'mpACUfTnvmqKy6HnChwVwryPaBLCD9wUAQ',
                            //type: 'send-max'
                        },
                        // TODO: op-return
                    ],
                    coin: 'Test',
                    push: true
                    //coin: 'ltc'
                })
                .then(handleResponse)
                .catch(function(e){
                    console.log("E!", e);
                });
            break;


            case 'requestLogin':
                TrezorConnect.requestLogin({
                    //selectedDevice: _selectedDevice,
                    account: 0,
                    coin: 'Test'
                })
                .then(handleResponse)
                .catch(function(e){
                    console.log("E!", e);
                });
            break;



            case 'getPublicKey' :
                //     selectedDevice: params.selectedDevice, // 'hid-100'
                //     path: "m/44'/0'/0'",
                //     path: [44, 0, 1],
                //     path: [44 | 0x80000000, 0  | 0x80000000, 0  | 0x80000000 ],
                //     account: 0,
                //     account: "0",
                //     coin: 'Bitcoin',
                //     coinUnits: 'millibitcoin', // 'millibitcoin', 'mbtc', 'satoshi', 'sat'
                //     confirmation: false // show confirmation popup
                //     accountDiscovery: false // if no path or account is set, skip accountDiscovery (do just quick look)

                TrezorConnect.getPublicKey({
                    //selectedDevice: _selectedDevice,

                    account: 0,
                    //accountLegacy: true,

                    //path: "m/48'/0'/0'",
                    //path: [44, 2, 20],
                    //path: [48, 0, 0], // multisig
                    //path: [45342, 44, 0, 0], // CopayId legacy
                    //path: [45342, 49, 0, 0], // CopayId segwit
                    //path: [45342, 48, 0, 0], // CopayId multisig
                    //path: [44 | 0x80000000, 1 | 0x80000000, 4 | 0x80000000 ],

                    //confirmation: false,

                    coin: 'Testnet',
                    //coin: 'ltc'
                })
                .then(handleResponse)
                .catch(function(e){
                    console.log("E!", e);
                });
            break;
        }
    }

}
