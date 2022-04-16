const mongoose = require('mongoose');

const hashtagSchema = new mongoose.Schema(
  {
    name: { type: String },
    tweets: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

const Hashtags = mongoose.model('Hashtag', hashtagSchema);
module.exports = { Hashtags };
