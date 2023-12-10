const path = require('path');
const {
    app,
    Menu,
    Tray,
    systemPreferences,
    clipboard,
} = require('electron');

let tray = null;
const clippings = [];
const getAppIcon = () => {
    if(process.platform === 'win32')
    {
        return 'imgs/Icon@2x.png';
    }
    else if(process.platform === 'darwin')
    {
        let macOsAppearance = systemPreferences.getEffectiveAppearance(); 
        if( macOsAppearance === 'light')
        {
            return 'imgs/Icon-light.png';
        }
        else if(macOsAppearance === 'dark')
        {
            return 'imgs/icon-dark.png';
        }
    }

    return 'imgs/icon-dark.png';
}

const updateTrayMenu = () => {
    const menu = Menu.buildFromTemplate([
        {
            label: 'Create New Clipping',
            click() {addClipping();},
            accelerator: 'CommandOrControl+Shif+C',
        },
        {
            type: 'separator'
        },
        ...clippings.map((clipping, index) => ({label: clipping})),
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            click() {app.quit();},
            accelerator: 'CommandOrControl+Q'
        }
    ]);

    tray.setContextMenu(menu);
}

const addClipping = () => {
    const clipping = clipboard.readText();
    
    clippings.push(clipping);
    updateTrayMenu();

    return clipping;
}

app.on('ready', () => {
    if(app.dock)
    {
        app.dock.hide();
    }

    tray = new Tray(path.join(__dirname, getAppIcon()));
    tray.setToolTip('Clipboard Master');

    if(process.platform === 'win32')
    {
        tray.on('click', tray.popUpContextMenu);
    }

    updateTrayMenu();
});