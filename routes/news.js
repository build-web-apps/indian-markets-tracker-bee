const express = require("express");

const router = express.Router();
const News = require("../models/news");

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const start = parseInt(req.query.start, 10) || 1;
    const news = await News.find({}).sort({ date: -1 }).skip(start - 1).limit(limit);
    res.json(news);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;