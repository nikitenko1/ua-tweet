const { Posts } = require('../models/Post');
const { Users } = require('../models/User');
const { Notifications } = require('../models/Notification');
const { Hashtags } = require('../models/Hashtag');
const { getFilteredPosts } = require('../utils/getFilteredPosts');
const { cloudinary } = require('../utils/cloudinary');
const removeTmp = require('../utils/removeTmp');

// @desc   Get post
// @route   GET /api/post/:id
exports.getSinglePost = async (req, res) => {
  try {
    const postId = req.params.id;
    let post = await getFilteredPosts({ _id: postId });
    post = post[0];
    res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\components\CreatePost.jsx
// const { data } = await axios.delete(`/post/${postId}`, config);

// @desc   Delete post
// @route   DELETE /api/post/:id
exports.deletePost = async (req, res) => {
  try {
    const result = await Posts.findByIdAndDelete(req.params.id);
    res.status(200).json(result._id);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Pin Any Tweet, allows you to pin the tweet of another user on your profile
// client\src\components\CreatePost.jsx
// await axios.put(`/post/${postId}`, body, config)

// @desc   Pin and unpin post
// @route   PUT /api/post/:id
exports.pinPost = async (req, res) => {
  try {
    if (req.body.pinned !== undefined) {
      // pinned: { type: Boolean, default: false },
      await Posts.updateMany({ postedBy: req.user.id }, { pinned: false });
    }
    await Posts.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json('success');
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\PostPage.jsx
// const { data } = await axios.get(`/post/${match.params.id}/detail`, config);

// @desc   Get post details
// @route   GET /api/post/:id/detail
exports.getPostDetails = async (req, res) => {
  try {
    let postId = req.params.id;

    let postData = await getFilteredPosts({ _id: postId });
    postData = postData[0];
    let results = {
      postData: postData,
    };
    if (postData.replyTo !== undefined) {
      results.replyTo = postData.replyTo;
    }
    results.replies = await getFilteredPosts({ replyTo: postId });
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// To delete your  Tw....f likes, select the tweet in question (or multiple….or all of them…),
// and click “unlike”.

// client\src\components\CreatePost.jsx
// const { data } = await axios.put(`/post/${postId}/like`, {}, config);

// @desc   Like or unlike post
// @route   POST /api/post/:id/like
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const isLiked = req.user.likes?.includes(postId);
    // { $addToSet: { <field1>: <value1>, ... } }
    const options = isLiked ? '$pull' : '$addToSet';
    await Users.findByIdAndUpdate(userId, { [options]: { likes: postId } });
    const post = await Posts.findByIdAndUpdate(
      postId,
      { [options]: { likes: userId } },
      { new: true }
    );
    // add ----------------------- Notification ---------------------
    if (!isLiked && post.postedBy.toString() !== userId.toString()) {
      await Notifications.insertNotification(
        post.postedBy,
        userId,
        'postLike',
        post._id
      );
    }

    res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// A Retweet is a re-posting of a Tweet.
// Tw....f's Retweet feature helps you and others quickly share that Tweet with all of your followers.

// @desc   Retweet or unretweet post
// @route   POST /api/post/:id/retweet
exports.retweetPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const deletedPost = await Posts.findOneAndDelete({
      postedBy: userId,
      retweetData: postId,
    });
    // { $addToSet: { <field1>: <value1>, ... } }
    const option = deletedPost != null ? '$pull' : '$addToSet';
    var repost = deletedPost;
    if (repost == null) {
      repost = await Posts.create({ postedBy: userId, retweetData: postId });
    }
    await Users.findByIdAndUpdate(
      userId,
      { [option]: { retweets: repost._id } },
      { new: true }
    );
    const post = await Posts.findByIdAndUpdate(
      postId,
      { [option]: { retweetUsers: userId } },
      { new: true }
    );
    // add ----------------------- Notification ---------------------
    if (!deletedPost && post.postedBy.toString() !== userId.toString()) {
      await Notifications.insertNotification(
        post.postedBy,
        userId,
        'retweet',
        post._id
      );
    }
    res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Bookmarks lets you save Tweets in a timeline for easy, quick access at any time.

// @desc   Bookmark and unbookmark post
// @route   PUT /api/post/:id
exports.bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const isBookmarked = req.user.bookmarks?.includes(postId);
    // { $addToSet: { <field1>: <value1>, ... } }
    const options = isBookmarked ? '$pull' : '$addToSet';

    await Users.findByIdAndUpdate(userId, { [options]: { bookmarks: postId } });
    res.status(200).json(!isBookmarked);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// On  Tw....f, adding a “#” to the beginning of an unbroken word or phrase creates a hashtag.

// @desc   Hashtag post
// @route   GET /api/post/:id
exports.hashtagPosts = async (req, res) => {
  try {
    let hashtag = req.params.name;
    const postsId = await Hashtags.find(
      { name: `#${hashtag}` },
      { tweets: 1 },
      { new: true }
    );
    // tweets: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
    const posts = await getFilteredPosts({ _id: { $in: postsId[0].tweets } });
    res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\redux\actions\postAction.js
// const { data } = await axios.get(`/post`, config);

// @desc    Get posts of following users and ourself
// @route   GET /api/post
exports.getPosts = async (req, res) => {
  try {
    let posts = await getFilteredPosts({
      // { field: { $in: [<value1>, <value2>, ... <valueN> ] } }
      postedBy: { $in: [...req.user.following, req.user.id] },
    });
    res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\components\TweetContainer.jsx
// const { data } = await axios.post(`/post`, formData, {headers: ... })

// @desc   Insert post
// @route  POST /api/post
exports.handlePost = async (req, res) => {
  try {
    const { text = '', replyTo = '', gif } = req.body;

    let public_id = '',
      url = '';
    let GIF = JSON.parse(gif);
    if (req.files === null && !text && !GIF?.url) {
      return res.status(400).json({ msg: "'No post content'" });
    }
    if (req.files?.image) {
      ({ public_id, url } = await cloudinary.v2.uploader.upload(
        req.files.image.tempFilePath,
        { folder: 'twitterf_posts' }
      ));
      // Resized to a width of 500 pixels (height is adjusted automatically to keep the aspect ratio):
      // correct supported format by setting the fetch_format parameter to auto (or f_auto in URLs)
      url = url.split('upload').join('upload/w_500/f_auto');
      removeTmp(req.files.image.tempFilePath);
    }
    if (GIF?.url && GIF?.id) {
      public_id = GIF.id;
      url = GIF.url;
    }
    let postData = {
      post: {
        text,
        postImg: {
          id: public_id,
          url: url,
        },
      },
      postedBy: req.user.id,
    };
    if (replyTo) {
      postData.replyTo = replyTo;
      await Posts.findByIdAndUpdate(replyTo, {
        // repliedUsers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
        $addToSet: { repliedUsers: req.user.id },
      });
    }
    let newPost = await Posts.create(postData);
    newPost = await Users.populate(newPost, { path: 'postedBy' });

    if (newPost.replyTo !== undefined) {
      // In MongoDB, Population is the process of replacing the specified path in the document
      // of one collection with the actual document from the other collection.
      // Need of Population: Whenever in the schema of one collection we provide a reference (in any field)
      // to a document from any other collection, we need a populate() method to fill the field with
      // that document
      newPost = await Posts.populate(newPost, { path: 'replyTo' });
      newPost = await Users.populate(newPost, { path: 'replyTo.postedBy' });

      // add ----------------------- Notification ---------------------
      await Notifications.insertNotification(
        newPost.replyTo.postedBy._id,
        req.user.id,
        'reply',
        newPost._id
      );
    }
    const re = /#[0-9a-z]\w*\b/gi;
    const string = newPost.post.text;
    string.match(re)?.forEach(async (s) => {
      const d = await Hashtags.updateOne(
        { name: s },
        { $addToSet: { tweets: newPost._id } },
        // Optional. When true, update() either:
        { upsert: true }
        // Creates a new document if no documents match the query.
        // Updates a single document that matches the query.
      );
      console.log(s, d);
    });
    res.status(200).json(newPost);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
