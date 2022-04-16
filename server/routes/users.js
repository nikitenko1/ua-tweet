const express = require('express');
const {
  getUser,
  getUserDetails,
  searchUser,
  getFollowingAndFollowers,
  handleCoverPhoto,
  handleProfilePhoto,
  handleEdit,
  handleFollow,
  getTweets,
  getRetweets,
  getReplies,
  getLikes,
  getBookmarks,
  getUsersToConect,
} = require('../controllers/user');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Express servers receive data from the client side through the req object
// in three instances: the req.params, req.query, and req.body objects
// req.params  '/:userid'
// req.query '/search'
// use the req.body object to receive data through POST and PUT requests in the Express server

router.get('/', auth, getUser);
router.get('/connect', auth, getUsersToConect);
router.post('/search', auth, searchUser);

router.put('/:username/follow', auth, handleFollow);
router.put('/:username/edit', auth, handleEdit);

router.get('/bookmarks', auth, getBookmarks);

router.get('/:username', auth, getUserDetails);
router.get('/:username/following_followers', auth, getFollowingAndFollowers);
router.post('/:username/cover_photo', auth, handleCoverPhoto);
router.post('/:username/profile_photo', auth, handleProfilePhoto);

router.get('/:username/tweets', auth, getTweets);
router.get('/:username/replies', auth, getReplies);
router.get('/:username/retweets', auth, getRetweets);
router.get('/:username/likes', auth, getLikes);

module.exports = router;
