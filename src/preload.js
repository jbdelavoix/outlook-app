const {
  ipcRenderer,
} = require("electron")


let count = 0

function getUnreadCount() {
  // Find the number next to the inbox label
  let navigation = document.querySelector(
    "i[data-icon-name=Inbox]"
  )

  if (navigation) {
    let label = navigation.parentElement.parentElement.querySelector(
      "span:last-of-type span"
    )
    // Return the unread count (0 by default)
    if (label) {
      return Number(/\d*/.exec(label.innerText))
    }
  }

  return 0
}


function updateUnreadCount() {

  let newCount = getUnreadCount()

  // Only fire the event when necessary
  if (count !== newCount) {
    ipcRenderer.send("unread-mails:count", newCount)
    count = newCount
  }
}


window.addEventListener("load", () => {
  // Set the initial unread count
  updateUnreadCount()

  // Listen to changes to the document title
  const title = document.querySelector("title")

  if (title) {
    const observer = new MutationObserver(updateUnreadCount)
    observer.observe(title, {
      childList: true
    })
  }

  // Check the unread count on an interval timer for instances where
  //   the title doesn"t change
  setInterval(updateUnreadCount, 1000)
})


window.addEventListener("contextmenu", (e) => {
  e.preventDefault()
  ipcRenderer.send("contextmenu:open", e.x, e.y)
}, false)
