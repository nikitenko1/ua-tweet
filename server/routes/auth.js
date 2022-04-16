const express = require('express');
const {
  register,
  registerVerification,
  resendRegisterToken,
  setPassword,
  changePassword,
  login,
  sendPasswordToken,
  passwordTokenVerification,
  logout,
} = require('../controllers/auth');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Express servers receive data from the client side through the req object
// in three instances: the req.params, req.query, and req.body objects
// req.params  '/:userid'
// req.query '/search'
// use the req.body object to receive data through POST and PUT requests in the Express server

router.post('/register', register);
router.post('/register-verify', registerVerification);
router.post('/resend-register-token', resendRegisterToken);

router.post('/register-verify', registerVerification);
router.post('/setpassword', setPassword);
router.post('/login', login);
//
router.post('/password-token', sendPasswordToken);
router.post('/password-token-verify', passwordTokenVerification);
//
router.put('/change-password', auth, changePassword);
router.post('/logout', auth, logout);

module.exports = router;
