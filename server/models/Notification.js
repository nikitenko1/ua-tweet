const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notificationType: { type: String },
    opened: { type: Boolean, default: false },
    entityId: mongoose.Schema.Types.ObjectId,
    loginInfo: { type: Object },
  },
  { timestamps: true }
);

NotificationSchema.statics.insertNotification = async (
  userTo,
  userFrom,
  notificationType,
  entityId,
  loginInfo = {}
) => {
  var data = {
    userTo,
    userFrom,
    notificationType,
    entityId,
    loginInfo,
  };
  await Notifications.deleteOne(data).catch((error) => console.log(error));
  return Notifications.create(data).catch((error) => console.log(error));
};

const Notifications = mongoose.model('Notification', NotificationSchema);
module.exports = { Notifications };
