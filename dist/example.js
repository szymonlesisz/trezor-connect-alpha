'use strict';

window.addEventListener('load', function() {
    initTrezor();
    initExample();
});

function initTrezor() {
    Trezor.on('connect', onDeviceConnect);
    Trezor.on('disconnect', onDeviceDisconnect);

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

var _devices = [];
var _selectedDevice;

function onDeviceConnect(device) {
    _devices.push(device);
    initNavigation();
}

function onDeviceDisconnect(device) {
    if (_selectedDevice === device.id) {
        _selectedDevice = null;
    }

    var index = -1;
    for (var i = 0; i < _devices.length; i++) {
        if (_devices[i].id === device.id) {
            index = i;
        }
    }
    _devices.splice(index, 1);

    initNavigation();
}

function initNavigation() {
    var nav = document.getElementsByTagName("nav")[0];
    var li = nav.getElementsByTagName("li");
    var empty = li[0];
    var ul = empty.parentNode;
    var i;
    while(li.length > 1) {
        ul.removeChild(li[1]);
    }

    if (_devices.length < 1) {
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        for (i = 0; i < _devices.length; i++) {
            var newLi = document.createElement("li");
            newLi.setAttribute("data-id", _devices[i].id);
            newLi.innerHTML = _devices[i].label;
            if (_devices[i].id === _selectedDevice) {
                newLi.className = "active";
            }
            ul.appendChild(newLi);
        }
    }

    li = nav.getElementsByTagName("li");
    for (var i = 0; i < li.length; i++) {
        li[i].addEventListener('click', selectDevice);
    }

    if(!_selectedDevice && _devices.length > 0) {
        li[1].click();
    }
}

function selectDevice(event) {

    if (event.target.className.indexOf("active") >= 0) {
        return;
    }

    var nav = document.getElementsByTagName("nav")[0];
    var li = nav.querySelectorAll(".active");
    [].forEach.call(li, function(current) {
        current.className = "";
    });
    event.target.className = "active";

    //if(_devices.length > 1) {
        _selectedDevice = event.target.getAttribute("data-id");
    // } else {
    //     _selectedDevice = null;
    // }
}

function initExample() {

    initNavigation();

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
                Trezor.call({
                    selectedDevice: _selectedDevice
                })
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
