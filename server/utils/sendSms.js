const { Twilio } = require('twilio');
// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;
const from = `${process.env.TWILIO_PHONE_NUMBER}`;
const serviceID = `${process.env.TWILIO_SERVICE_ID}`;

const client = new Twilio(accountSid, authToken, { accountSid });

exports.sendSms = (user, text, res) => {
  try {
    const message = client.messages.create({
      body: text,
      from,
      to: `+${user.intl}${user.phone}`,
    });
    console.log(message);
    res.status(200).json({
      success: true,
      id: user._id,
      phone: true,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ msg: 'Please use email. Sorry for the inconvinence' });
  }
};

exports.smsOTP = async (to, channel) => {
  try {
    // Start Twilio verify
    const data = await client.verify.services(serviceID).verifications.create({
      to,
      channel,
    });
    return data;
  } catch (err) {
    console.log(err);
  }
};

exports.smsVerify = async (to, code) => {
  try {
    // Check Twilio verify code
    const data = await client.verify
      .services(serviceID)
      .verificationChecks.create({
        to,
        code,
      });
    return data;
  } catch (err) {
    console.log(err);
  }
};
