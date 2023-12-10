const path = require('path');
const {
    app,
    Menu,
    Tray,
    systemPreferences,
    clipboard,
    globalShortcut,
    BrowserWindow,
} = require('electron');

let tray = null;
const clippings = [];
let browserWindow = null;

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

const getClippingShortLabel = (clipping) => {
    let shortLabel = null;

    if(clipping.length > 20)
    {
        shortLabel = clipping.slice(0, 20) + '...';
    }
    else
    {
        shortLabel = clipping;
    }

    return shortLabel;
}

const createClippingMenuItem = (clipping, index) => {
    return {
        label: getClippingShortLabel(clipping),
        click() {
            clipboard.writeText(clipping);
        },
        accelerator: `CommandOrControl+${index}`
    };
};

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
        ...clippings.slice(0, 10).map(createClippingMenuItem),
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
    
    if(clippings.includes(clipping))
    {
        return;
    }
    
    clippings.unshift(clipping);
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

    if(process.platform === 'darwin')
    {
        tray.setPressedImage('imgs/Icon-light.png');
    }

    browserWindow = new BrowserWindow({
        nodeIntegration: true,
        sandbox: false,
        worldSafeExecuteJavascript: false,
        contextIsolation: false,
        show: false,
    });
    
    browserWindow.webContents.loadFile(path.join(__dirname, 'index.html'));

    const osWideActivationShortcut = globalShortcut.register(
        'CommandOrControl+Option+C',
        () => { tray.popUpContextMenu(); }
    );

    if(!osWideActivationShortcut)
    {
        console.error('Global activation shortcut registration failed.');
    }

    const osWideNewClippingShortcut = globalShortcut.register(
        'CommandOrControl+Shift+Option+C',
        () =>{ 
            const clipping = addClipping(); 
            if(clipping)
            {
                browserWindow.webContents.send('show-notification', 'Clipping Added', clipping);
            }
        },
    );

    if(!osWideNewClippingShortcut)
    {
        console.error('Global new clipping shortcut registration failed.');
    }

    updateTrayMenu();
});