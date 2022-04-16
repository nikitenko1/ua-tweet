const express = require('express');
const {
  handleChat,
  getChatList,
  getChat,
  updateChat,
  getChatMessages,
  markChatAsRead,
} = require('../controllers/chats');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Express servers receive data from the client side through the req object
// in three instances: the req.params, req.query, and req.body objects
// req.params  '/:userid'
// req.query '/search'
// use the req.body object to receive data through POST and PUT requests in the Express server

router.post('/', auth, handleChat);
router.get('/', auth, getChatList);

router.get('/:chatId', auth, getChat);
router.put('/:chatId', auth, updateChat);

router.get('/:chatId/messages', auth, getChatMessages);
router.put('/:chatId/markasread', auth, markChatAsRead);

module.exports = router;
