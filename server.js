const express = require('express');
const socket = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socket(server);

io.on('connection', socket => {
  console.log('connection!!');
  socket.on('join-room', (roomId, userId) => {
    console.log(`Joined room: ${roomId}, ${userId}`);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

server.listen(8000);
