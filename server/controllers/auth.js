const crypto = require('crypto');
const { Users } = require('../models/User');
const { Notifications } = require('../models/Notification');
const {
  passwordEmailHtml,
  passwordSmsText,
  registerSmsText,
  registerEmailHtml,
} = require('../utils/otpHtml');
const { sendEmail } = require('../utils/sendMail');
const { sendSms } = require('../utils/sendSms');
const { resUser } = require('../utils/userResponse');

// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email = '', phone = {}, dob, username } = req.body;
    const isPhone = !(
      // var phone = {}; console.log(phone.constructor === Object); // true
      // phone.constructor = "foo"; console.log(o.constructor === Object); // false
      (Object.keys(phone).length === 0 && phone.constructor === Object)
    );
    let user;
    if (!email && !isPhone)
      return res.status(400).json({ msg: 'Enter email or phone' });

    if (email) user = await Users.findOne({ email });
    else if (isPhone) user = await Users.findOne({ phone: phone.phoneNo });

    if (user && user.active) {
      return res
        .status(400)
        .json({ msg: `You are already registered with ${email || phone}` });
    }
    if (email) {
      if (user && !user.active) {
        user.name = name;
        user.dob = dob;
        user.username = username;
        sendTokenToEmail(user, res, next);
      } else {
        const newUser = await Users.create({
          name,
          email,
          dob,
          username,
        });
        sendTokenToEmail(newUser, res, next);
      }
    }

    if (isPhone) {
      if (user && !user.active) {
        user.name = name;
        user.dob = dob;
        user.intl = phone.intl;
        user.username = username;
        sendTokenToPhone(user, res, next);
      } else {
        const newUser = await Users.create({
          name,
          email,
          dob,
          username,
        });
        sendTokenToPhone(newUser, res, next);
      }
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @desc    verify the register token
// @route   POST /api/auth/register-verify
exports.registerVerification = async (req, res) => {
  try {
    const { email = '', phone = ' ', otp } = req.body;
    if (!email && !phone)
      return res.status(400).json({ msg: 'Invalid credentials' });
    // OTP means One Time Password:
    const registerToken = otp;
    const user = await Users.findOne({
      $or: [{ email }, { phone }],
      registerToken,
      registerTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({ msg: 'You have not registered' });
    }
    // const userSchema
    user.active = true;
    user.registerToken = undefined;
    user.registerTokenExpire = undefined;

    await user.save();
    // jwt.sign({ id: this._id } // 2) Passing only the _id:
    res.json({
      id: user.id,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// OTP means One Time Password:
// it's a temporary, secure PIN-code sent to you via SMS or e-mail that is valid only for one session

// @desc    Resend register token
// @route   POST /api/auth/resend-register-token
exports.resendRegisterToken = async (req, res, next) => {
  try {
    const { email = '', phone = '' } = req.body;

    if (!email && !phone)
      return res.status(400).json({ msg: 'Invalid credentials' });
    const user = await Users.findOne({ $or: [{ email }, { phone }] });

    if (user && user.active) {
      return res
        .status(400)
        .json({ msg: 'You are already registered with this email' });
    }

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credential' });
    }
    email
      ? sendTokenToEmail(user, res, next)
      : sendTokenToPhone(user, user.intl, res, next);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @desc    Update password after token verification
// @route   POST /api/auth/setpassword
exports.setPassword = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!password || !id)
      return res.status(400).json({ msg: 'Invalid credential' });
    // const userSchema = new mongoose.Schema(
    // tokens: { select: false },
    const user = await Users.findById({ _id: id }).select('+tokens');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credential' });
    }
    user.password = password;
    const token = user.getSignedJwtToken();
    user.tokens.push(token);
    await user.save();

    res.status(200).json({
      token,
      user: resUser(user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @desc    Update password after token verification
// @route   POST /api/auth/setpassword
exports.changePassword = async (req, res) => {
  try {
    const { id, currentPassword = '', newPassword = '' } = req.body;

    if (!currentPassword || !id || !newPassword)
      return res.status(400).json({ msg: 'Invalid credential' });
    // const userSchema = new mongoose.Schema(
    // password: { select: false },
    // tokens: { select: false },
    const user = await Users.findById({ _id: id }).select([
      '+password',
      '+tokens',
    ]);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credential' });
    }
    // Check if password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Current Password not matching' });
    }

    user.password = newPassword;
    const token = user.getSignedJwtToken();

    user.tokens = [];
    user.tokens.push(token);
    await user.save();

    res.status(200).json({
      token,
      user: resUser(user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @desc    User login
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { account, password, info } = req.body;

    if (!account || !password)
      return res.status(400).json({ msg: 'All fields are required' });
    // const userSchema = new mongoose.Schema(
    // password: { select: false },
    // tokens: { select: false },
    const user = await Users.findOne({
      $or: [{ username: account }, { email: account }, { phone: account }],
    }).select(['+password', '+tokens']);
    if (!user)
      return res
        .status(401)
        .json({ msg: 'Details you entered did not match our records' });

    if (!user.active)
      return res.status(401).json({ msg: 'Account not activated' });

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(401).json({ msg: 'Password is not matching' });

    const token = user.getSignedJwtToken();
    user.tokens.push(token);

    await user.save();

    // add ----------------------- Notification ---------------------
    await Notifications.insertNotification(
      user._id,
      user._id,
      'new login',
      user._id,
      info
    );

    res.status(200).json({
      token,
      user: resUser(user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
// client\src\pages\Auth\StartPasswordReset.jsx
// const { data } = await axios.post(`/auth/password-token`, { account, });

// @desc    Forgot password token
// @route   POST /api/auth/password-token
exports.sendPasswordToken = async (req, res, next) => {
  try {
    const { account } = req.body;
    if (!account) return res.status(400).json({ msg: 'Invalid credentials' });

    const user = await Users.findOne({
      $or: [{ username: account }, { email: account }, { phone: account }],
    });

    if (!user) {
      return res.status(401).json({ msg: 'This account does not exist' });
    }

    if (!user.active)
      return res.status(401).json({ msg: 'Account not activated' });

    if (user.email) sendTokenToEmail(user, res, next);
    else if (user.phone) sendTokenToPhone(user, user.intl, res, next);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// @desc    Forgot password token verification
// @route   POST /api/auth/password-token-verify
exports.passwordTokenVerification = async (req, res) => {
  try {
    const { id, code } = req.body;

    if (!id && !code)
      return res.status(400).json({ msg: 'Invalid credentials' });

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    const user = await Users.findOne({
      _id: id,
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({ msg: `Invalid token ${code}` });
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      succes: true,
      id: user.id,
      name: user.name,
      username: user.username,
      profilePhoto: user.profilePhoto,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { token = '' } = req.body;

    if (!token) return res.status(400).json({ msg: 'Invalid credentials' });
    await Users.updateOne({ _id: req.user.id }, { $pull: { tokens: token } });

    res.status(200).json({ msg: 'Logged out Success' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

async function sendTokenToEmail(user, res, next) {
  let token, html, subject;

  if (user.active) {
    token = user.getResetPasswordToken();
    html = passwordEmailHtml(token, user.username);
    subject = 'Password reset request';
  } else {
    token = user.getRegisterToken();
    html = registerEmailHtml(token);
    subject = `${token} is your Twitterf verification code`;
  }
  await user.save({ validateBeforeSave: false });

  sendEmail(user, subject, html, res, next);
}

async function sendTokenToPhone(user, res, next) {
  let token, text;

  if (user.active) {
    token = user.getResetPasswordToken();
    text = passwordSmsText(token, user.username);
  } else {
    token = user.getRegisterToken();
    text = registerSmsText(token);
  }

  await user.save({ validateBeforeSave: false });

  sendSms(user, text, res, next);
}
