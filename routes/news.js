const express = require("express");

const router = express.Router();
const News = require("../models/news");

router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const start = req.query.start || 1;
    const news = await News.find({}).sort({ date: -1 }).skip(start - 1).limit(start + limit);
    res.json(news);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;