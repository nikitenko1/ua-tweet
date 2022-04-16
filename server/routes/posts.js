const express = require('express');
const {
  getSinglePost,
  deletePost,
  pinPost,
  getPostDetails,
  likePost,
  retweetPost,
  bookmarkPost,
  hashtagPosts,
  getPosts,
  handlePost,
} = require('../controllers/post');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Express servers receive data from the client side through the req object
// in three instances: the req.params, req.query, and req.body objects
// req.params  '/:userid'
// req.query '/search'
// use the req.body object to receive data through POST and PUT requests in the Express server

router.get('/:id', auth, getSinglePost);

router.delete('/:id', auth, deletePost);

router.put('/:id', auth, pinPost);

router.get('/:id/detail', auth, getPostDetails);

router.put('/:id/like', auth, likePost);

router.post('/:id/retweet', auth, retweetPost);

router.put('/:id/bookmark', auth, bookmarkPost);

router.get('/hashtag/:name', auth, hashtagPosts);

router.get('/', auth, getPosts);

router.post('/', auth, handlePost);

module.exports = router;
