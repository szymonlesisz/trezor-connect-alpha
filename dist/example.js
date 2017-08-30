'use strict';

window.addEventListener('load', function() {
    initTrezor();
    initExample();
});

function initTrezor() {
    Trezor.on('connect', function(data){
        console.log("[example] onConnect", data)
        showSnackbar("Connected: " + data.id);
    });
    Trezor.on('disconnect', function(data){
        console.log("[example] onDisconnect", data)
        showSnackbar("Disconnected");
    });
    Trezor.on('released', function(data){
        console.log("[example] onReleased", data)
    });
    Trezor.on('acquired', function(data){
        console.log("[example] onAcquired", data)
    });
    Trezor.on('error', function(data){
        console.log("[example] error", data)
        showSnackbar("Error");
    });

    Trezor.init();

    // setTimeout(function(){
    //     var iframe = document.getElementById("randomid");
    //     iframe.contentWindow.addEventListener('message', function(m){
    //         console.warn("Injected OnMessage", m);
    //     })
    // }, 1000);
}

function initExample() {
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
        var description = "m/44'/0'/0'";
        var firmware = "1.3.4";

        switch (method) {

            case 'requestLogin':
                Trezor.call()
                .then(handleResponse).catch(function(e){
                    console.log("E!", e);
                })
            break;
        }
    }

    var jsonPrettyPrint = {
        replacer: function(match, pIndent, pKey, pVal, pEnd) {
            var key = '<span class=json-key>';
            var val = '<span class=json-value>';
            var str = '<span class=json-string>';
            var r = pIndent || '';
            if (pKey)
                r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
            if (pVal)
                r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
            return r + (pEnd || '');
        },
        toHtml: function(obj) {
            var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
            return JSON.stringify(obj, null, 3)
                .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(jsonLine, jsonPrettyPrint.replacer);
        }
    };
}


function showSnackbar(message) {
    var x = document.getElementsByClassName("snackbar")[0];
    x.className += " show";
    x.innerHTML = message;
    setTimeout(function(){
        x.className = x.className.replace(" show", "");
    }, 3000);
}
