const express = require('express');
const {
  getNotifications,
  markAsOpened,
  markAsOpenedAll,
  getLatest,
} = require('../controllers/notification');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Express servers receive data from the client side through the req object
// in three instances: the req.params, req.query, and req.body objects
// req.params  '/:userid'
// req.query '/search'
// use the req.body object to receive data through POST and PUT requests in the Express server

router.get('/', auth, getNotifications);
router.put('/:id/markasopened', auth, markAsOpened);
router.put('/markasopened', auth, markAsOpenedAll);
router.get('/latest', auth, getLatest);

module.exports = router;
