const jwt = require('jsonwebtoken');
const { Users } = require('../models/User');

exports.auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`);

      req.user = await Users.findById(decoded.id).select('+tokens');

      if (req.user.tokens.includes(token) && req.user) next();
      else next(res.status(401).json({ msg: 'Not authorized' }));
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
};
