const { Users } = require('../models/User');
const { Chats } = require('../models/Chat');
const { Messages } = require('../models/Message');

// client\src\pages\Message\Message.jsx
// const { data } = await axios.get(`/chat`, config);

// client\src\pages\Message\NewMessage.jsx
// const { data } = await axios.post(`/chat`, { users }, config)

// @desc    Handling new chat
// @route   POST /api/chat
exports.handleChat = async (req, res) => {
  try {
    const { users } = req.body;
    let chatProfilePic;
    if (users.length === 0) {
      return res.status(400).json({ msg: `No users to chat` });
    }
    users.unshift(req.user.id);

    const chatUsers = await Users.find(
      { _id: { $in: users } },
      { name: 1, profilePhoto: 1 },
      { new: true }
    );
    let chatName = chatUsers
      .filter((user) => user._id != req.user.id)
      .map((user) => user.name)
      .join(', ');
    chatName =
      chatName.length <= 50 ? chatName : chatName.substr(0, 47) + '...';

    const isGroupChat = users.length > 2 ? true : false;

    if (isGroupChat) chatProfilePic = './icon-group.png';
    else
      chatProfilePic = chatUsers.find((user) => user._id == req.user.id)
        .profilePhoto.url;

    const results = await Chats.create({
      chatName,
      users,
      isGroupChat,
      chatProfilePic,
    });
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\Message\Message.jsx
// const { data } = await axios.get(`/chat`, config);

// client\src\redux\actions\chatActions.js
// const { data } = await axios.get(`/chat`, config)

// @desc    Get user chats
// @route   GET /api/chat
exports.getChatList = async (req, res) => {
  try {
    let results = await Chats.find({
      // The $elemMatch operator matches documents that contain an array field
      // with at least one element that matches all the specified query criteria
      // { <field>: { $elemMatch: { <query1>, <query2>, ... } } }
      users: { $elemMatch: { $eq: req.user.id } },
    })
      // In MongoDB, Population is the process of replacing the specified path in the document
      // of one collection with the actual document from the other collection.
      // Need of Population: Whenever in the schema of one collection we provide a reference (in any field)
      // to a document from any other collection, we need a populate() method to fill the field with
      // that document
      .populate('users', { name: 1, username: 1, profilePhoto: 1 })
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    // client\src\redux\actions\chatActions.js
    // const { data } = await axios.get(`/chat?unreadOnly=true`, config)

    // req.params contains route parameters (in the path portion of the URL), 1
    // and req.query contains the URL query parameters (after the ? in the URL).
    if (req.query.unreadOnly !== undefined && req.query.unreadOnly == 'true') {
      results = results.filter(
        (r) => r.latestMessage && !r.latestMessage.readBy.includes(req.user.id)
      );
    }
    results = await Users.populate(results, {
      path: 'latestMessage.sender',
      select: { name: 1, username: 1, profilePhoto: 1 },
    });
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\Message\ChatPage.jsx
// const { data } = await axios.get(`/chat/${match.params.chatId}/messages`, config);

// @desc    Get messages of specific chat
// @route   GET /api/chat/:chatId/messages
exports.getChatMessages = async (req, res) => {
  try {
    // In MongoDB, Population is the process of replacing the specified path in the document
    // of one collection with the actual document from the other collection.
    // Need of Population: Whenever in the schema of one collection we provide a reference (in any field)
    // to a document from any other collection, we need a populate() method to fill the field with
    // that document
    const results = await Messages.find({ chat: req.params.chatId }).populate(
      'sender',
      { name: 1, username: 1, profilePhoto: 1 }
    );
    await Messages.updateMany(
      { chat: req.params.chatId },
      // { $addToSet: { <field1>: <value1>, ... } }
      //  $addToSet only ensures that there are no duplicate items added to the set
      { $addToSet: { readBy: req.user.id } }
    );
    const { isGroupChat } = await Chats.findById(req.params.chatId, {
      isGroupChat: 1,
    });
    res.status(200).json({ results, isGroupChat });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\Message\ChatInfo.jsx
// const { data } = await axios.get(`/chat/${match.params.chatId}`, config)

// @desc    Get specific chat
// @route   GET /api/chat/:chatId
exports.getChat = async (req, res) => {
  try {
    const results = await Chats.findOne({
      _id: req.params.chatId,
      users: { $elemMatch: { $eq: req.user.id } },
    })
      // In MongoDB, Population is the process of replacing the specified path in the document
      // of one collection with the actual document from the other collection.
      // Need of Population: Whenever in the schema of one collection we provide a reference (in any field)
      // to a document from any other collection, we need a populate() method to fill the field with
      // that document
      .populate('users', { name: 1, username: 1, profilePhoto: 1 });

    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\Message\ChatInfo.jsx
// const { data } = await axios.put(`/chat/${match.params.chatId}`, { chatName }, config)

// @desc    Updating chat name
// @route   PUT /api/chat/:chatId
exports.updateChat = async (req, res) => {
  try {
    const { chatName = '' } = req.body;
    if (!chatName)
      return res.status(400).json({ msg: `No Chatname to update` });
    const results = await Chats.findByIdAndUpdate(
      { _id: req.params.chatId },
      { chatName },
      { new: true }
    );

    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\Message\ChatPage.jsx
// axios.put(`/chat/${match.params.chatId}/messages/markasread`, {}, config);

// @desc    Marking chat as read
// @route   PUT /api/chat/:chatId/messages/markasread
exports.markChatAsRead = async (req, res) => {
  try {
    await Messages.updateOne(
      { chat: req.params.chatId },
      // { $addToSet: { <field1>: <value1>, ... } }
      //  $addToSet only ensures that there are no duplicate items added to the set
      { $addToSet: { readBy: req.user.id } }
    );
    res.status(200);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
