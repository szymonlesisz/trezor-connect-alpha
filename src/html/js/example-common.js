

// navigation

var _devices = [];
var _selectedDevice;

function redrawNavigation() {
    var nav = document.getElementsByTagName("nav")[0];
    var li = nav.getElementsByTagName("li");
    var empty = li[0];
    var ul = empty.parentNode;
    var i;
    while(li.length > 1) {
        ul.removeChild(li[1]);
    }

    if (_devices.length < 1) {
        empty.style.display = "block";
    } else {
        empty.style.display = "none";
        for (i = 0; i < _devices.length; i++) {
            var newLi = document.createElement("li");
            newLi.setAttribute("data-path", _devices[i].path);
            newLi.innerHTML = _devices[i].label;
            if (_devices[i].unacquired) {
                newLi.classList.add("unacquired");
            }
            if (_devices[i].isUsedElsewhere) {
                newLi.classList.add("used-elsewhere");
            }
            if (_devices[i].featuresNeedsReload) {
                newLi.classList.add("reload-features");
            }

            if (_devices[i].path === _selectedDevice) {
                newLi.classList.add("active");
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

    if (event.target.classList.contains("active")) {
        return;
    }

    var nav = document.getElementsByTagName("nav")[0];
    var li = nav.querySelectorAll(".active");
    [].forEach.call(li, function(current) {
        current.classList.remove("active");
    });
    event.target.classList.add("active");

    _selectedDevice = event.target.getAttribute("data-path");
}


// event handlers

function findDeviceIndexByPath(path) {
    var index = -1;
    for (var i = 0; i < _devices.length; i++) {
        if (_devices[i].path === path) {
            index = i;
            break;
        }
    }
    return index;
}

function onDeviceConnect(device) {
    var index = findDeviceIndexByPath(device.path);
    if (index > -1) {
        _devices[index] = device;
    } else {
        _devices.push(device);
    }
    redrawNavigation();
}

function onDeviceDisconnect(device) {
    if (_selectedDevice === device.path) {
        _selectedDevice = null;
    }

    var index = findDeviceIndexByPath(device.path);
    if (index > -1) {
        _devices.splice(index, 1);
    }
    redrawNavigation();
}

function onDeviceUsedElsewhere(device) {
    var index = findDeviceIndexByPath(device.path);
    var needRedraw = false;
    if (index > -1) {
        _devices[index] = device;
        needRedraw = true;
    }
    if (needRedraw)
        redrawNavigation();
}


/// utils

function showSnackbar(message) {
    var x = document.getElementsByClassName("snackbar")[0];
    x.className += " show";
    x.innerHTML = message;
    setTimeout(function(){
        x.className = x.className.replace(" show", "");
    }, 3000);
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
