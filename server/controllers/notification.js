const { Notifications } = require('../models/Notification');

// client\src\redux\actions\notifyAction.js
// const { data } = await axios.get(`/notification?unreadOnly=true`, config);

// client\src\pages\Notification.jsx
// const { data } = await axios.get(`/notification`, config);

// @desc    Get notifications initially when the app starts
// @route   GET /api/notication
exports.getNotifications = async (req, res) => {
  try {
    var searchObj = {
      userTo: req.user.id,
      // NotificationSchema: notificationType: { type: String },
      notificationType: { $ne: 'newMessage' },
    };
    // notifications actions client side
    // const { data } = await axios.get(`/notification?unreadOnly=true`, config);

    // req.params contains route parameters (in the path portion of the URL), 1
    // and req.query contains the URL query parameters (after the ? in the URL).
    if (req.query.unreadOnly !== undefined && req.query.unreadOnly == 'true') {
      searchObj.opened = false;
    }

    // In MongoDB, Population is the process of replacing the specified path in the document
    // of one collection with the actual document from the other collection.
    // Need of Population: Whenever in the schema of one collection we provide a reference (in any field)
    // to a document from any other collection, we need a populate() method to fill the field with
    // that document

    let results = await Notifications.find(searchObj)
      .populate('userTo', { profilePhoto: 1, name: 1, username: 1 })
      .populate('userFrom', { profilePhoto: 1, name: 1, username: 1 })
      .sort({ createdAt: -1 });

    if (req.query.unreadOnly !== undefined && req.query.unreadOnly == 'true') {
      results = results.filter(
        (r) => r.userFrom._id.toString() != r.userTo._id.toString()
      );
    }
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\Notification.jsx
// await axios.put(`/notification/${id}/markasopened`, {}, config);

// @desc    Mark specific notification as opened
// @route   POST /api/notication/:id/markasopened
exports.markAsOpened = async (req, res) => {
  await Notifications.findByIdAndUpdate(req.params.id, { opened: true });
  res.sendStatus(204);
};

// @desc    Mark all notifications as opened
// @route   POST /api/notication/markasopened
exports.markAsOpenedAll = async (req, res) => {
  await Notifications.updateMany({ userTo: req.user.id }, { opened: true });
  res.sendStatus(204);
};

exports.getLatest = async (req, res) => {
  const results = await Notifications.findOne({ userTo: req.user.id })
    // In MongoDB, Population is the process of replacing the specified path in the document
    // of one collection with the actual document from the other collection.
    // Need of Population: Whenever in the schema of one collection we provide a reference (in any field)
    // to a document from any other collection, we need a populate() method to fill the field with
    // that document

    .populate('userTo')
    .populate('userFrom')
    .sort({ createdAt: -1 });
  res.status(200).send(results);
};
