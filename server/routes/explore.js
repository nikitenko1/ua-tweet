const express = require('express');
const {
  getBusinessNews,
  getScienceNews,
  getSportsNews,
  getHealthNews,
} = require('../controllers/explore');
const router = express.Router();

// Express servers receive data from the client side through the req object
// in three instances: the req.params, req.query, and req.body objects
// req.params  '/:userid'
// req.query '/search'
// use the req.body object to receive data through POST and PUT requests in the Express server

router.get('/business', getBusinessNews);
router.get('/science', getScienceNews);
router.get('/sports', getSportsNews);
router.get('/health', getHealthNews);

module.exports = router;
