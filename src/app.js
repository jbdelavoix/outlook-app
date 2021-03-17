const {
  app,
  ipcMain,
  BrowserWindow,
  Menu,
} = require("electron")
const fs = require("fs")
const path = require("path")

const website_url = "https://outlook.office365.com/mail/inbox"

function addMenu(platform) {
  let menu = Menu.buildFromTemplate([
    { role: "appMenu" },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More"
        }
      ]
    }
  ])

  if (platform == "darwin") {
    Menu.setApplicationMenu(menu)
  } else {
    Menu.setApplicationMenu(null)
  }
}


function createWindow() {

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    icon: path.join(__dirname, "../build/icons/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })

  // Load the app
  mainWindow.loadURL(website_url)

  // Load custom style
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.insertCSS(
      fs.readFileSync(path.join(__dirname, "style.css"), "utf8")
    )
  })

  mainWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault()
    mainWindow.loadURL(url)
  })

  // On ipcEvent...
  ipcMain.on("unread-mails:count", function (event, unreadMails) {
    if (unreadMails != 0) {
      app.dock.setBadge(unreadMails.toString())
    } else {
      app.dock.setBadge("")
    }
  })

  ipcMain.on("contextmenu:open", function (event, x, y) {
    let contextmenu = Menu.buildFromTemplate([{
      role: "undo"
    },
    {
      role: "redo"
    },
    {
      type: "separator"
    },
    {
      role: "cut"
    },
    {
      role: "copy"
    },
    {
      role: "paste"
    },
    {
      type: "separator"
    },
    {
      label: "Advanced",
      submenu: [{
        role: "reload"
      },
      {
        role: "toggleDevTools"
      },
      ]
    }
    ])
    contextmenu.popup({
      window: mainWindow,
      x,
      y
    })
  })

  if (process.platform == "darwin") {
    app.on("activate-with-no-open-windows", function () {
      mainWindow.show()
    })
  }

  // Emitted when the window is closed.
  mainWindow.on("close", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    if (process.platform != "darwin") {
      mainWindow = null
    } else {
      mainWindow.hide()
    }
  })
}


// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null

// Add menu
addMenu(process.platform)

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  app.quit()
})

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on("ready", createWindow)
