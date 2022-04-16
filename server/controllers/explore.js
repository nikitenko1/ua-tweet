const axios = require('axios');

// @route   GET /api/explore/business
exports.getBusinessNews = async (req, res) => {
  const { data } = await axios.get(
    `https://newsapi.org/v2/top-headlines?country=gb&category=business&apiKey=${process.env.NEWS_API_KEY}`
  );
  res.status(200).json(data);
};
// @route   GET /api/explore/science
exports.getHealthNews = async (req, res) => {
  const { data } = await axios.get(
    `https://newsapi.org/v2/top-headlines?country=gb&category=health&apiKey=${process.env.NEWS_API_KEY}`
  );
  res.status(200).json(data);
};
// @route   GET /api/explore/sports
exports.getScienceNews = async (req, res) => {
  const { data } = await axios.get(
    `https://newsapi.org/v2/top-headlines?country=gb&category=science&apiKey=${process.env.NEWS_API_KEY}`
  );
  res.status(200).json(data);
};
// @route   GET /api/explore/health
exports.getSportsNews = async (req, res) => {
  const { data } = await axios.get(
    `https://newsapi.org/v2/top-headlines?country=gb&category=sports&apiKey=${process.env.NEWS_API_KEY}`
  );
  res.status(200).json(data);
};
