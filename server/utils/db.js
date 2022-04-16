const mongoose = require('mongoose');

const URI = process.env.MONGO_URL;
// connect MongoDB Atlas
mongoose.connect(
  `${URI}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) throw err;
    console.log('Connected to MongoDB Atlas');
  }
);
