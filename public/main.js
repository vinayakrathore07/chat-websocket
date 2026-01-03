const socket = io()

// ==============================
// DOM ELEMENTS
// ==============================
const clientsTotal = document.getElementById('client-total')
const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const roomSelect = document.getElementById('room-select')
const usersList = document.getElementById('users-list')

// ==============================
// SOUND
// ==============================
const messageTone = new Audio('/message-tone.mp3')

// ==============================
// STATE
// ==============================
let currentRoom = 'general'
let hasJoined = false

// ==============================
// INITIAL UI STATE
// ==============================
messageInput.disabled = true
messageInput.placeholder = 'Enter your name to start chatting'

// ==============================
// JOIN WITH USERNAME (ON ENTER)
// ==============================
nameInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || hasJoined) return

  const name = nameInput.value.trim()
  if (!name) {
    alert('Please enter your name')
    return
  }

  socket.emit('join-room', {
    room: currentRoom,
    name,
  })

  hasJoined = true

  // enable chat
  messageInput.disabled = false
  messageInput.placeholder = 'Type a message...'
  messageInput.focus()

  nameInput.blur()
})

// ==============================
// PREVENT CHAT WITHOUT NAME
// ==============================
messageInput.addEventListener('focus', () => {
  if (!hasJoined) {
    messageInput.blur()
    nameInput.focus()
  }
})

// ==============================
// TOTAL CLIENTS
// ==============================
socket.on('clients-total', (count) => {
  clientsTotal.innerText = `Total Members: ${count}`
})

// ==============================
// SEND MESSAGE
// ==============================
messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
})

function sendMessage() {
  if (!hasJoined) {
    messageInput.placeholder = 'Please enter your name first'
    return
  }

  if (messageInput.value.trim() === '') return

  const data = {
    room: currentRoom,
    name: nameInput.value.trim(),
    message: messageInput.value,
    dateTime: new Date(),
    socketId: socket.id,
  }

  socket.emit('message', data)
  messageInput.value = ''
}

// ==============================
// RECEIVE MESSAGE
// ==============================
socket.on('chat-message', (data) => {
  // 🔥 SYSTEM MESSAGE
  if (data.socketId === 'system') {
    addSystemMessage(data.message)
    return
  }

  const isOwnMessage = data.socketId === socket.id
 // 🔥 PLAY SOUND ONLY FOR RECEIVER
  if (!isOwnMessage) {
    messageTone.play()
  }  addMessageToUI(isOwnMessage, data)
})


// ==============================
// ADD MESSAGE TO UI
// ==============================
function addMessageToUI(isOwnMessage, data) {
  clearFeedback()
 const authorHTML = isOwnMessage
    ? `<span class="message-author you-author">you</span>`
    : `<span class="message-author">${data.name}</span>`
  const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        ${authorHTML}     
         </p>
    </li>
  `

  messageContainer.innerHTML += element
  scrollToBottom()
}


function addSystemMessage(message) {
  clearFeedback()

  const element = `
    <li class="system-message">
      ${message}
    </li>
  `

  messageContainer.innerHTML += element
  scrollToBottom()
}


// ==============================
// SCROLL
// ==============================
function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight
}

// ==============================
// ROOM SWITCH
// ==============================
roomSelect.addEventListener('change', () => {
  if (!hasJoined) return

  const newRoom = roomSelect.value

  socket.emit('switch-room', {
    oldRoom: currentRoom,
    newRoom,
    name: nameInput.value.trim(),
  })

  currentRoom = newRoom

  messageContainer.innerHTML = ''
  usersList.innerHTML = ''
})

// ==============================
// TYPING FEEDBACK
// ==============================
messageInput.addEventListener('input', () => {
  if (!hasJoined) return

  socket.emit('feedback', {
    room: currentRoom,
    feedback: `✍️ ${nameInput.value} is typing...`,
  })
})

messageInput.addEventListener('blur', () => {
  if (!hasJoined) return

  socket.emit('feedback', {
    room: currentRoom,
    feedback: '',
  })
})

// ==============================
// RECEIVE FEEDBACK
// ==============================
socket.on('feedback', (data) => {
  clearFeedback()
  if (!data.feedback) return

  const element = `
    <li class="message-feedback">
      <p class="feedback">${data.feedback}</p>
    </li>
  `
  messageContainer.innerHTML += element
})

// ==============================
// RECEIVE ROOM USERS
// ==============================
socket.on('room-users', (users) => {
  usersList.innerHTML = ''

  users.forEach((user) => {
    const li = document.createElement('li')

    if (user.id === socket.id) {
      li.innerHTML = `${user.name} <span class="you-badge">(you)</span>`
    } else {
      li.innerText = user.name
    }

    usersList.appendChild(li)
  })
})


socket.on('join-error', (data) => {
  alert(data.message)

  // 🔥 RESET CLIENT STATE
  hasJoined = false
  messageInput.disabled = true
  messageInput.value = ''
  messageInput.placeholder = 'Enter your name to start chatting'

  nameInput.focus()
})



// ==============================
// CLEAR FEEDBACK
// ==============================
function clearFeedback() {
  document
    .querySelectorAll('.message-feedback')
    .forEach((el) => el.remove())
}
