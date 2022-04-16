const { Users } = require('../models/User');
const { Chats } = require('../models/Chat');
const { Messages } = require('../models/Message');
const { Notifications } = require('../models/Notification');

// client\src\pages\Message\ChatPage.jsx
// const { data } = await axios.post(`/message`, {content: message, chatId: match.params.chatId}, config)

// @desc    Inserting messages
// @route   POST /api/message
exports.handleMessage = async (req, res) => {
  try {
    const { content = '', chatId = '' } = req.body;

    if (!content || !chatId)
      return res.status(400).json({ msg: `No chat data` });

    let message = await Messages.create({
      sender: req.user.id,
      content,
      chat: chatId,
      readBy: [req.user.id],
    });

    // In MongoDB, Population is the process of replacing the specified path in the document
    // of one collection with the actual document from the other collection.
    // Need of Population: Whenever in the schema of one collection we provide a reference (in any field)
    // to a document from any other collection, we need a populate() method to fill the field with
    // that document
    message = await message
      .populate('sender', { profilePhoto: 1, name: 1, username: 1 })
      .execPopulate();
    message = await message.populate('chat').execPopulate();
    //const ChatSchema: users: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    message = await Users.populate(message, {
      path: 'chat.users',
      select: { profilePhoto: 1, name: 1, username: 1 },
    });

    const chat = await Chats.findByIdAndUpdate(
      chatId,
      { latestMessage: message._id },
      { new: true }
    );

    chat.users.forEach(async (userId) => {
      if (userId == message.sender._id.toString()) return;
      // add ----------------------- Notification ---------------------
      Notifications.insertNotification(
        userId,
        message.sender._id,
        'newMessage',
        message.chat._id
      );
    });
    res.status(200).json(message);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
