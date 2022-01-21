const express = require("express");

const router = express.Router();
const News = require("../models/news");

router.get("/", async (req, res) => {
  try {
    const news = await News.find({}).sort({ date: -1 });
    res.json(news);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;