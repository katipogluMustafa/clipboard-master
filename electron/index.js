const path = require('path');
const {
    app,
    Menu,
    Tray,
    systemPreferences,
} = require('electron');

let tray = null;

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

app.on('ready', () => {
    if(app.dock)
    {
        app.dock.hide();
    }

    tray = new Tray(path.join(__dirname, getAppIcon()));

    if(process.platform === 'win32')
    {
        tray.on('click', tray.popUpContextMenu);
    }

    const menu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            click() {app.quit();}
        }
    ]);

    tray.setToolTip('Clipboard Master');
    tray.setContextMenu(menu);
});