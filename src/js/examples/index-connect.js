/* @flow */
'use strict';

import { init as initRouter } from './Router';
import { onDeviceConnect, onDeviceDisconnect, onDeviceUsedElsewhere } from './deviceMenu';
import { Tree } from './jsonTree';

import styles from  '../../styles/explorer.less';


const initTrezorConnect = () => {

    // inited from script query
    // TrezorConnect.init({
    //     iframe_src: 'iframe.html',
    //     //popup_src: 'popup.html',
    //     coins_src: 'coins.json',
    //     transport_config_src: 'config_signed.bin',
    //     firmware_releases_src: 'releases.json',
    //     latest_bridge_src: 'latest.txt',
    //     debug: false,
    //     notValidParam: function() { }
    // });

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
}

const initExample = () => {

    initRouter();

    const handleButtonClick = (event) => {
        const method: string = event.currentTarget.getAttribute('data-id');
        window.location.hash = '#' + method;
    }

    var i;
    var buttons = document.querySelectorAll('.methods ul li');
    for (i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', handleButtonClick);
    }

    const handleTabClick = (event) => {
        const div = document.querySelector('.method-result');
        div.classList.remove('response');
        div.classList.remove('code');

        const currentTab = event.currentTarget.getAttribute('data-tab');
        div.classList.add( currentTab );

        if (currentTab === 'code') {
            document.getElementById('code').innerHTML = '';
        }
    }

    var tabs = document.querySelectorAll('.method-result-menu div');
    for (i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', handleTabClick);
    }
}

var resp = document.getElementById('response');
function handleResponse(response){
    if(response === undefined){
        console.error("Undefined response");
        return;
    }

    resp.innerHTML = '';
    new Tree(response, resp);
    console.log(response);
}
// expose to global
window.handleResponse = handleResponse;


window.addEventListener('load', function() {
    initTrezorConnect();
    initExample();
});

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
        return JSON.stringify(obj);
        // return JSON.stringify(obj, undefined, 3)
        //     .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
        //     .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        //     .replace(jsonLine, jsonPrettyPrint.replacer);
    }
};
