const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const filter = new Filter();
const bannedIPs = new Set();

io.use((socket, next) => {
  const ip = socket.handshake.address;
  if (bannedIPs.has(ip)) {
    return next(new Error('banned'));
  }
  next();
});

io.on('connection', (socket) => {
  const ip = socket.handshake.address;

  socket.on('message', (msg) => {
    if (filter.isProfane(msg.text)) {
      bannedIPs.add(ip);
      socket.emit('banned');
      socket.disconnect();
    } else {
      io.emit('message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${ip}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
