import { app, BrowserWindow, Menu, shell } from 'electron';

var mainWindow = null;

const setHeaders = (mainWindow) => {
    let session = mainWindow.webContents.session
    session.webRequest.onBeforeSendHeaders((details, callback) => {
        let url = details.url
        if (url.startsWith('https://localback.net:21324')) {
            if (details.requestHeaders.Origin === 'null') {
                delete details.requestHeaders.Origin
            }
        }
        callback( {cancel: false, requestHeaders: details.requestHeaders} );
    })
}

app.on('ready', () => {

    mainWindow = new BrowserWindow({
        show: false,
        width: 600,
        height: 400,
        webPreferences: {
            nativeWindowOpen: true
        }
    });

    mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        if (frameName === 'modal') {
            // open window as modal
            event.preventDefault();
            Object.assign(options, {
                modal: true,
                parent: mainWindow,
                width: 100,
                height: 100
            })
            event.newGuest = new BrowserWindow(options)
        }
    })

    setHeaders(mainWindow);

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.webContents.on('closed', () => {
        mainWindow = null;
    });
});

