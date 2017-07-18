//import TrezorConnect from '../../src/TrezorConnect';
//import TrezorConnect from 'TrezorConnect';


document.getElementById('login-button').addEventListener('click', function(){

    // TrezorConnect.requestLogin( {
    //     container: 'modal',
    //     //container: 'popup',
    //     icon: 'icon.png',
    //     challengeVisual: false,
    //     challengeHidden: false,
    //     requiredFirmware: 'firmware'
    // } )
    // .then(
    //     function(resp){
    //         console.log("RequestLogin response:", resp)
    //     }
    // );

    TrezorConnect.getXPubKey({
        container: 'modal',
        description: "m/44'/0'/0'"
    }).then(
        function(response){
            console.log("getXPubKey response:", response);
        }
    )

});
