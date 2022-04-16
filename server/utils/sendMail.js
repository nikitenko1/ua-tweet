const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

const CLIENT_ID = `${process.env.MAIL_CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.MAIL_CLIENT_SECRET}`;
const REFRESH_TOKEN = `${process.env.MAIL_REFRESH_TOKEN}`;
const SENDER_MAIL = `${process.env.SENDER_EMAIL_ADDRESS}`;

const oAuth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  OAUTH_PLAYGROUND
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// send mail
const sendEmail = async (user, subject, html, res) => {
  try {
    const access_token = await oAuth2Client.getAccessToken();
    if (!access_token) {
      return new Error('Unknown user');
    }

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: SENDER_MAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        access_token: access_token,
      },
    });
    const mailOptions = {
      from: 'Twitterf <example@example.com>',
      to: user.email,
      subject,
      html,
    };

    res.status(200).json({
      success: true,
      id: user._id,
      email: true,
    });
    await transport.sendMail(mailOptions);

    console.log(`Message sent successfully to ${user.email}`);
  } catch (err) {
    return res.status(500).json({ msg: 'email could not be sent' });
  }
};

module.exports = { sendEmail };
