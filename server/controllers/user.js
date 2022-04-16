const { resUser } = require('../utils/userResponse');
const { getFilteredPosts } = require('../utils/getFilteredPosts');
const { Users } = require('../models/User');
const { Hashtags } = require('../models/Hashtag');
const { Notifications } = require('../models/Notification');
const { cloudinary } = require('../utils/cloudinary');
const removeTmp = require('../utils/removeTmp');

// client\src\App.js
// const { data } = await axios.get(`/user`, {headers: {Authorization: `Bearer ${token}`}});

// @desc    Get user details
// @route   GET /api/user
exports.getUser = async (req, res) => {
  const user = req.user;
  res.status(200).json({
    user: resUser(user),
  });
};

// client\src\pages\Message\NewMessage.jsx
// const { data } = await axios.post(`/user/search`, { search }, config);

// @desc    Search for users
// @route   POST /api/user/search
exports.searchUser = async (req, res) => {
  try {
    const { search = '' } = req.body;
    let hashtags = [];

    const users = await Users.find(
      {
        $or: [
          // case insensitivity to match upper and lower cases
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
        ],
        username: { $ne: req.user.username },
      },
      // projection --> determine which fields to include in the returned documents
      { name: 1, username: 1, profilePhoto: 1 }
    );

    // client\src\components\SearchComponent.jsx
    // const { data } = await axios.post(`/user/search?hashtag=true`, { search }, config)

    // req.params contains route parameters (in the path portion of the URL), 1
    // and req.query contains the URL query parameters (after the ? in the URL).
    if (req.query.hashtag !== 'undefined' && req.query.hashtag === 'true') {
      hashtags = await Hashtags.find(
        { name: { $regex: search, $options: 'i' } },
        { name: 1 }
      );
    }
    res.status(200).json({ users, hashtags });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const getUserByUsername = async (username, res) => {
  const user = await Users.findOne({ username });

  if (!user) return res.status(400).json({ msg: 'Invalid username' });

  return user;
};

// @route   PUT /api/user/:username/follow
exports.handleFollow = async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);

    const isFollowing = user.followers?.includes(req.user.id);
    // { $addToSet: { <field1>: <value1>, ... } }
    //  $addToSet only ensures that there are no duplicate items added to the set
    // { $pull: { <field1>: <value|condition>, ... } }

    const option = isFollowing ? '$pull' : '$addToSet';
    const result = await Users.findByIdAndUpdate(
      req.user.id,
      { [option]: { following: user._id } },
      { new: true }
    );

    await Users.findByIdAndUpdate(user._id, {
      [option]: { followers: req.user.id },
    });

    // add ----------------------- Notification ---------------------
    if (!isFollowing) {
      await Notifications.insertNotification(
        user._id,
        req.user.id,
        'follow',
        req.user.id
      );
    }

    res.status(200).json({ user: resUser(result), isFollowing: !isFollowing });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   PUT /api/user/:username/edit
exports.handleEdit = async (req, res) => {
  try {
    const username = req.params.username;
    const { name, bio = '', location = '', website = '' } = req.body;

    const user = await Users.findOneAndUpdate(
      { username },
      { name, bio, location, website },
      { new: true }
    );

    if (!user) return res.status(400).json({ msg: 'Invalid username' });

    res.status(200).json({
      user: resUser(user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   GET /api/user/:username
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await getUserByUsername(req.params.username, next);
    res.status(200).json({
      user: resUser(user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\FollowerFollowing\FollowerFollowingPage.jsx
// const { data } = await axios.get(`/user/${match.params.username}/following_followers`, config)

// @route   GET /api/user/:username/following_followers
exports.getFollowingAndFollowers = async (req, res, next) => {
  try {
    const user = await getUserByUsername(req.params.username, next);

    const followingId = [...user.following];
    const followersId = [...user.followers];

    const following = await Users.find({ _id: { $in: followingId } });
    const followers = await Users.find({ _id: { $in: followersId } });

    res.status(200).json({ following, followers });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   POST /api/user/:username/cover_photo
exports.handleCoverPhoto = async (req, res) => {
  try {
    const username = req.params.username;

    if (req.files === null) {
      return res.status(400).json({ msg: 'No post content' });
    }
    let { public_id, url } =
      // A path to the temporary file in case useTempFiles option was set to true.
      await cloudinary.v2.uploader.upload(req.files.coverPhoto.tempFilePath, {
        folder: 'twitterf_coverPhoto',
      });

    removeTmp(req.files.coverPhoto.tempFilePath);
    const user = await Users.findOneAndUpdate(
      { username },
      { coverPhoto: { public_id, url } },
      { new: true }
    );
    res.status(200).json({
      user: resUser(user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   POST /api/user/:username/profile_photo
exports.handleProfilePhoto = async (req, res) => {
  try {
    const username = req.params.username;
    if (req.files === null) {
      return res.status(400).json({ msg: 'No post content' });
    }
    let { public_id, url } = await cloudinary.v2.uploader.upload(
      req.files.profilePhoto.tempFilePath,
      { folder: 'twitterf_profilePhoto' }
    );
    // Resized to a width of 200 pixels (height is adjusted automatically to keep the aspect ratio):
    // correct supported format by setting the fetch_format parameter to auto (or f_auto in URLs)
    url = url.split('upload').join('upload/w_200/f_auto');
    removeTmp(req.files.profilePhoto.tempFilePath);
    const user = await Users.findOneAndUpdate(
      { username },
      { profilePhoto: { public_id, url } },
      { new: true }
    );

    res.status(200).json({
      user: resUser(user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   GET /api/user/:username/tweets
exports.getTweets = async (req, res, next) => {
  try {
    const user = await getUserByUsername(req.params.username, next);

    const tweets = await getFilteredPosts({
      postedBy: user._id,
      // If <$exists> is false, the query returns only the documents that do not contain the field.
      replyTo: { $exists: false },
      retweetData: { $exists: false },
    });
    const pinnedTweet = tweets.find((tweet) => tweet.pinned === true);
    res.status(200).json({ tweets, pinnedTweet });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   GET /api/user/:username/retweets
exports.getRetweets = async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);

    const retweets = await getFilteredPosts({ _id: { $in: user.retweets } });

    res.status(200).json(retweets);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   GET /api/user/:username/replies
exports.getReplies = async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);

    const tweets = await getFilteredPosts({
      postedBy: user._id,
      replyTo: { $exists: true },
    });

    res.status(200).json(tweets);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   GET /api/user/:username/likes
exports.getLikes = async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);

    const likes = await getFilteredPosts({ _id: { $in: user.likes } });

    res.status(200).json(likes);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @route   GET /api/user/bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await getFilteredPosts({
      _id: { $in: req.user.bookmarks },
    });

    res.status(200).json(bookmarks);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// client\src\pages\WhoToFollow.jsx
// const { data } = await axios.get(`/user/connect?limit=4`, config)

// @route   GET /api/user/connect
exports.getUsersToConect = async (req, res) => {
  try {
    let users;
    // req.params contains route parameters (in the path portion of the URL), 1
    // and req.query contains the URL query parameters (after the ? in the URL).
    if (req.query.limit !== undefined) {
      users = await Users.find(
        // Syntax: { field: { $nin: [ <value1>, <value2> ... <valueN> ] } }
        {
          _id: { $nin: [...req.user.following, req.user.id] },
        },
        { name: 1, username: 1, profilePhoto: 1, role: 1 }
      ).limit(Number.parseInt(req.query.limit));
    } else {
      users = await Users.find(
        { _id: { $nin: [...req.user.following, req.user.id] } },
        { name: 1, username: 1, profilePhoto: 1, role: 1 }
      );
    }
    res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
