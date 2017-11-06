function handleModalEvent(type, data) {

    switch (type) {
        case 'ui-request_window' :
            console.log("-----open popup!")
            openModal();
            TrezorConnect.uiMessage({ type: 'popup_handshake' });
        break;

        case 'ui-close_window' :
            closeModal();
        break;

        case 'ui-request_pin' :
            showPin();
        break;

        case 'ui-invalid_pin' :
            invalidPin();
        break;

        case 'ui-request_permission' :
            requestPermissions(data);
        break;

        case 'ui-request_confirmation' :
            requestConfirmation(data);
        break;

        case 'ui-select_account' :
            console.log("DATA", data)
        break;
    }
}

function openModal() {
    var div = document.querySelector('.modal-container');
    div.style.display = 'block';
}

function closeModal() {
    var div = document.querySelector('.modal-container');
    div.style.display = 'none';
}

function showPin() {
    var div = document.querySelector('.modal-window');
    div.innerHTML = '<input type="text" id="pin_input" /><button class="ok_button">OK</button>';

    var button = document.querySelector('.ok_button');
    var input = document.getElementById("pin_input");
    button.onclick = function() {
        TrezorConnect.uiMessage({ type: 'ui-receive_pin', data: input.value });
        closeModal();
    }
}

function invalidPin() {
    var div = document.querySelector('.modal-window');
    div.innerHTML = 'invalid pin';
}


function requestPermissions() {
    var div = document.querySelector('.modal-window');
    div.innerHTML = '<h2>Permissions</h2><button class="ok_button">OK</button>';

    var button = document.querySelector('.ok_button');
    button.onclick = function() {
        TrezorConnect.uiMessage({ type: 'ui-receive_permission', data: true });
        div.innerHTML = '';
    }
}

function requestConfirmation() {
    var div = document.querySelector('.modal-window');
    div.innerHTML = '<h2>Confirmation</h2><button class="ok_button">OK</button>';

    var button = document.querySelector('.ok_button');
    button.onclick = function() {
        TrezorConnect.uiMessage({ type: 'ui-receive_confirmation', data: true });
        div.innerHTML = '';
    }
}
