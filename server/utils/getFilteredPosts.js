const { Posts } = require('../models/Post');
const { Users } = require('../models/User');

const getFilteredPosts = async (filter) => {
  var posts = await Posts.find(filter)
    .populate('postedBy') // ref: 'User'
    .populate('retweetData') // ref: 'Post'
    .populate('replyTo') // ref: 'Post'
    .sort({ createdAt: -1 });

  posts = await Users.populate(posts, { path: 'replyTo.postedBy' });

  return await Users.populate(posts, { path: 'retweetData.postedBy' });
};

module.exports = { getFilteredPosts };
