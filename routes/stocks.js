const fs = require("fs");
const express = require("express");
const multer = require("multer");
const parse = require("csv-parser");

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});
const upload = multer({ storage: fileStorageEngine });
const Stock = require("../models/stock");
const SampleSchema = require('../models/sample');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.json(stocks);
  } catch (err) {
    res.json({ message: err });
  }
});

const processData = async (results) => {
  const stocks = [];
  let temp = 0;
  results.map(async (result) => {
    const find = await Stock.find({ symbol: result.SYMBOL });
    // console.log(find);
    if (find.length === 0) {
      console.log('Inside', results.length, ++ temp);
      stocks.push({
        symbol: result.SYMBOL,
        isin: result.ISIN,
        series: result.SERIES
      })
    }
    if (temp >= results.length) {
        console.log('Stocks', stocks.length);
      
      Stock.collection.insertMany(stocks, (err, docs) => {
        if (err) {
          console.log(err);
        } else {
          console.info('%d stocks were saved', docs.length);
        }
      })
    }

});
  
}

router.post("/dump", upload.single("dump"), async (req, res, next) => {
  const results = [];
  try {
    console.log(req.file);
    fs.createReadStream(req.file.path)
      .pipe(parse())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        processData(results);
      });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
