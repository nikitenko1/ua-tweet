require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const fileUpload = require('express-fileupload');

const app = express();

// Cloud Mongodb Atlas
require('./utils/db');

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// This will enable the file to be stored on a temp folder
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query

// To remove data using these defaults:
app.use(mongoSanitize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/users'));
app.use('/api/post', require('./routes/posts'));
app.use('/api/explore', require('./routes/explore'));
app.use('/api/message', require('./routes/messages'));
app.use('/api/chat', require('./routes/chats'));
app.use('/api/notification', require('./routes/notifications'));

// Production Deploy
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'build', 'index.html'));
  });
}

// Listen server
const PORT = process.env.PORT || 8800;
const server = app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

// Socket
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('user-join', (user) => {
    socket.join(user.id);
    socket.emit('user-connected');
  });
  socket.on('join-room', (room) => socket.join(room));
  // to all clients in room1
  //  io.in("room1").emit(/* ... */);
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessage) => {
    var chat = newMessage.chat;

    if (!chat.users) return console.log('Chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
      socket.in(user._id).emit('message received', newMessage);
    });
  });
  socket.on('notification received', (userId) => {
    socket.in(userId).emit('notification received');
  });
});
