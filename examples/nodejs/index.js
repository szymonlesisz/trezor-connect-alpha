import TrezorConnect from '../src/index-node';


console.log("Welcome to TrezorConnect for NodeJS.");
//console.log("Type \"help\" for available commands...");
console.log("Type \"login\" ...");

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (text) {
    //console.log('received data:', text);
    if (text === 'help\n') {
        help();
    }

    if (text === 'login\n') {
        login();
    }

    if (text === 'quit\n') {
        done();
    }
});

function help(){
    console.log("TODO: print commands");
    // process.stdin.pause();
}

function done(){
    console.log("done!");
    process.exit();
}

function login() {
    TrezorConnect.requestLogin({})
    .then(response => {
        console.log("RequestLogin response:", response)
    });
}


