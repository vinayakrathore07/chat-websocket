const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 4000

const server = app.listen(PORT, () =>
  console.log(`💬 server running on port ${PORT}`)
)

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))

// =======================
// STATE (Single Source of Truth)
// =======================
const socketsConnected = new Set()
const roomUsers = {} // { roomName: [{ id, name }] }

// =======================
// SOCKET.IO
// =======================
io.on('connection', (socket) => {
  console.log('🟢 Connected:', socket.id)

  socketsConnected.add(socket.id)
  io.emit('clients-total', socketsConnected.size)

// =======================
// JOIN ROOM
// =======================
socket.on('join-room', ({ room, name }) => {

  if (!roomUsers[room]) roomUsers[room] = []

  // 🔥 CHECK: duplicate username in same room
  const nameExists = roomUsers[room].some(
    (user) => user.name.toLowerCase() === name.toLowerCase()
  )

  if (nameExists) {
    // ❌ reject join for this user only
    socket.emit('join-error', {
      message: 'Username already taken in this room',
    })
    return
  }

  // ✅ SAFE TO JOIN
  socket.join(room)
  socket.currentRoom = room
  socket.username = name

  roomUsers[room].push({ id: socket.id, name })

  // update users list for everyone
  io.to(room).emit('room-users', roomUsers[room])

  // 🔥 notify ONLY existing users
  socket.broadcast.to(room).emit('chat-message', {
    name: 'system',
    message: `🟢 ${name} joined the chat`,
    dateTime: new Date(),
    socketId: 'system',
  })
})

  // =======================
  // SWITCH ROOM
  // =======================
  socket.on('switch-room', ({ oldRoom, newRoom, name }) => {
    // leave old room
    socket.leave(oldRoom)

    if (roomUsers[oldRoom]) {
      roomUsers[oldRoom] = roomUsers[oldRoom].filter(
        (user) => user.id !== socket.id
      )

      io.to(oldRoom).emit('room-users', roomUsers[oldRoom])

      socket.broadcast.to(oldRoom).emit('system-message', {
        message: `🔴 ${name} left`,
      })
    }

    // join new room
    socket.join(newRoom)
    socket.currentRoom = newRoom

    if (!roomUsers[newRoom]) roomUsers[newRoom] = []

    roomUsers[newRoom].push({ id: socket.id, name })

    io.to(newRoom).emit('room-users', roomUsers[newRoom])

    socket.broadcast.to(newRoom).emit('system-message', {
      message: `🟢 ${name} joined`,
    })
  })

  // =======================
  // CHAT MESSAGE
  // =======================
  socket.on('message', (data) => {
    io.to(data.room).emit('chat-message', data)
  })

  // =======================
  // TYPING FEEDBACK
  // =======================
  socket.on('feedback', (data) => {
    socket.broadcast.to(data.room).emit('feedback', data)
  })

  // =======================
  // DISCONNECT
  // =======================
  socket.on('disconnect', () => {
    console.log('🔴 Disconnected:', socket.id)

    socketsConnected.delete(socket.id)
    io.emit('clients-total', socketsConnected.size)

    const room = socket.currentRoom
    if (room && roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter(
        (user) => user.id !== socket.id
      )

      // update users list
      io.to(room).emit('room-users', roomUsers[room])

      // 🔥 SHOW DISCONNECT MESSAGE IN CHAT
        io.to(room).emit('chat-message', {
        name: 'system',
        message: `❌ ${socket.username} left the chat`,
        dateTime: new Date(),
        socketId: 'system',
      })
    }
  })
})
