function handleModalEvent(type, data) {
    console.log("MODAL", type, data)

    switch (type) {
        case 'ui-request_window' :
            console.log("-----open popup!")
            openModal();
            Trezor.uiMessage({ type: 'popup_handshake' });
        break;

        case 'ui-close_window' :
            closeModal();
        break;

        case 'ui-request_permission' :
            requestPermissions(data);
        break;

        case 'ui-request_confirmation' :
            requestConfirmation(data);
        break;

        case 'ui-select_device' :
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


function requestPermissions() {
    var div = document.querySelector('.modal-window');
    div.innerHTML = '<h2>Permissions</h2><button class="ok_button">OK</button>';

    var button = document.querySelector('.ok_button');
    button.onclick = function() {
        Trezor.uiMessage({ type: 'ui_receive_permission', data: true });
        div.innerHTML = '';
    }
}

function requestConfirmation() {
    var div = document.querySelector('.modal-window');
    div.innerHTML = '<h2>Confirmation</h2><button class="ok_button">OK</button>';

    var button = document.querySelector('.ok_button');
    button.onclick = function() {
        Trezor.uiMessage({ type: 'ui_receive_confirmation', data: true });
        div.innerHTML = '';
    }
}
