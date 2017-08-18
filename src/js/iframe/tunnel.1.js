import ConnectChannelBrowserLite from '../connect/ConnectChannelBrowserLite';
import DeviceManager, { SHOW_COMPONENT } from './DeviceManager';
import DeviceList from '../device/DeviceList';
import ConnectedDevice from '../connect/ConnectedDevice';
import { errorHandler, NO_CONNECTED_DEVICES } from '../utils/promiseUtils';


var finish = false;
var _device: ConnectedDevice;
var _popup;

function onMessage(event){

    // i'm not sure why first message is served from tunnel.js
    if(event.source === window) return;

    if (!_device) {
        _popup = createWindow();
    } else if(!_device.isLogged()) {
        _popup = createWindow();
        console.log("MAM DEVICE!", _device)
        return;
    }

    setTimeout( () => {
        postMessage(event, "LEGIA!");
    }, 2000)

    return;

    console.log("[tunnel.js]", "onMessage", event)
    const { data } = event;
    if (data.type === 'call') {

        // let ch = new ConnectChannelBrowserLite();
        // ch.on(SHOW_COMPONENT, (a) => {
        //     console.log("SHOW COMPO!", a)
        // });
        // ch.on(SHOW_OPERATION, this.showOperation.bind(this));
        // this.channel.on(UPDATE_VIEW, this.updateView.bind(this));
        // this.channel.on(REQUEST_CONFIRM, this.requestConfirm.bind(this));
        // this.channel.on(REQUEST_PIN, this.requestPin.bind(this));
        // this.channel.on(REQUEST_PASSPHRASE, this.requestPassphrase.bind(this));

        // fetch('https://bch-bitcore2.trezor.io/api/addr/1JEcxcVQ7vFfCmLnms1Cf9G1NaNbGnHPhT').then(response => {
        // //fetch('http://google.com').then(response => {
        //     console.log("FETCH", response)
        // });


        // var button = document.getElementById('popup_link');
        document.addEventListener('mousedown', () => {
            console.log("CLICK!")
            createWindow();
        });

        // var timeout = setTimeout( () => {
        //     //fireEvent(document, 'mousedown');

        //     createWindow();
        //     //fireEvent(document, 'mouseup');
        // }, 1000);


        // new Promise(resolve => {

        // }).then( r => {
        //     //createWindow();
        //     //button.click(event);

        // })

        // setTimeout(() => {
        //     createWindow();
        // }, 1000)


        initTransport()
        .then(list => waitForFirstDevice(list))
        .then(device => {
            console.log("init trans", device);
            _device = device;
            //clearTimeout(timeout);
        })





        // let interval = setInterval( () => {
        //     if(fin){
        //         createWindow();
        //         clearInterval(interval);
        //     }
        //     console.log("fin", fin);
        // }, 300);

    }
};


function fireEvent(node, eventName) {
    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
    var doc;
    if (node.ownerDocument) {
        doc = node.ownerDocument;
    } else if (node.nodeType == 9){
        // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
        doc = node;
    } else {
        throw new Error("Invalid node passed to fireEvent: " + node.id);
    }

     if (node.dispatchEvent) {
        // Gecko-style approach (now the standard) takes more work
        var eventClass = "";

        // Different events have different event classes.
        // If this switch statement can't map an eventName to an eventClass,
        // the event firing is going to fail.
        switch (eventName) {
            case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
            case "mousedown":
            case "mouseup":
                eventClass = "MouseEvents";
                break;

            case "focus":
            case "change":
            case "blur":
            case "select":
                eventClass = "HTMLEvents";
                break;

            default:
                throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                break;
        }
        var event = doc.createEvent(eventClass);
        event.initEvent(eventName, true, true); // All events created as bubbling and cancelable.

        event.synthetic = false; // allow detection of synthetic events
        // The second parameter says go ahead with the default action
        node.dispatchEvent(event, true);
    } else  if (node.fireEvent) {
        // IE-old school style, you can drop this if you don't need to support IE8 and lower
        var event = doc.createEventObject();
        event.synthetic = true; // allow detection of synthetic events
        node.fireEvent("on" + eventName, event);
    }
};

async function initTransport() {

    let promise = new Promise((resolve, reject) => {
        let list = new DeviceList({
            config: null,
            debug: false
        });

        const onTransport = (e) => {
            list.removeListener('error', onError);
            list.removeListener('transport', onTransport);
            list.on('transport', (a) => {
                console.warn("ontransport", a);
            })
            resolve(list);

            console.log("INIT TRANSP", e)
        };
        const onError = () => {
            list.removeListener('error', onError);
            list.removeListener('transport', onTransport);
            reject("NO_TRANSPORT");
        };
        list.on('error', onError);
        list.on('transport', onTransport);
    });

    try {
        return await promise;
    } catch (error) {
        throw error;
    }
}

const REQUIRED_FIRMWARE = '1.0.0';

async function waitForFirstDevice(list: DeviceList): Promise<Device> {
    let promise = new Promise((resolve, reject) => {
        if (!list.hasDeviceOrUnacquiredDevice()) {
            reject(NO_CONNECTED_DEVICES);
        } else {
            list.acquireFirstDevice(true)
                .then(({device, session}) => new ConnectedDevice(session, device))
                .then(device => {
                    if(device.isBootloader()){
                        reject("DEVICE_IS_BOOTLOADER");
                    }else if(!device.isInitialized()){
                        reject("DEVICE_IS_EMPTY");
                    }else if(!device.atLeast(REQUIRED_FIRMWARE)){
                        reject("FIRMWARE_IS_OLD");
                    }else{
                        resolve(device);
                    }
                });
        }
    });

    try {
        // looping case
        // first param is a looping function, second is a alert emiter
        return await promise.catch(errorHandler(
            () => waitForFirstDevice(list),
            //alert => this.emit(SHOW_COMPONENT, alert)
            alert => (a) => { console.log("ALERT", a)}
        ));
    } catch (error) {
        throw error;
    }
}


const handleTimeout = () => {
    if(finish)
        createWindow();
}

const settings = {
    popupURL: 'popup.html'
}


const POPUP_WIDTH: Number = 600;
const POPUP_HEIGHT: Number = 500;

const channel = {
};


const createWindow = () => {
    let left = (window.screen.width - POPUP_WIDTH) / 2,
        top = (window.screen.height - POPUP_HEIGHT) / 2,
        width = POPUP_WIDTH,
        height = POPUP_HEIGHT,
        opts =
            `width=${width}
            ,height=${height}
            ,left=${left}
            ,top=${top}
            ,menubar=no
            ,toolbar=no
            ,location=no
            ,personalbar=no
            ,status=no`;
    return window.open(settings.popupURL, '_blank', opts);
    //window.open(settings.popupURL, '_blank');
};

const postMessage = (event, message) => {
    if (!window.top) {
        console.error('Cannot reach window.top');
        return;
    }
    let origin = (event.origin !== 'null') ? event.origin : '*';
    console.log("[tunnel.js]", "postMessage", message, origin);
    window.top.postMessage(message, origin);
}

window.addEventListener('load', () => {
    window.addEventListener('message', onMessage, false);
    postMessage({ origin: 'null' }, { type: 'handshake' });
}, false);


class Trezor {
    init() {
        console.log("T2init");
    }
}

module.exports = Trezor;
