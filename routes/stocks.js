const fs = require("fs");
const express = require("express");
const multer = require("multer");
const parse = require("csv-parser");

const request = require("request");
var HTMLParser = require("node-html-parser");

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
const StockPeerSchema = require("../models/peers");
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
      console.log("Inside", results.length, ++temp);
      stocks.push({
        symbol: result.SYMBOL,
        isin: result.ISIN,
        series: result.SERIES,
      });
    }
    if (temp >= results.length) {
      console.log("Stocks", stocks.length);

      Stock.collection.insertMany(stocks, (err, docs) => {
        if (err) {
          console.log(err);
        } else {
          console.info("%d stocks were saved", docs.length);
        }
      });
    }
  });
};

const processMetaData = async (results) => {
  const stocks = [];
  let temp = 0;
  results.map(async (result) => {
    const find = await Stock.find({ symbol: result.SYMBOL });
    // console.log(find);
    if (find.length === 0) {
      console.log("Inside present", results.length, ++temp);
      stocks.push({
        symbol: result.SYMBOL,
        isin: result["ISIN NUMBER"],
        series: result.SERIES,
        name: result["NAME OF COMPANY"],
        faceValue: result["FACE VALUE"],
        dateOfListing: result["DATE OF LISTING"],
      });
    }
    if (temp >= results.length) {
      console.log("Stocks", stocks.length);

      Stock.collection.insertMany(stocks, (err, docs) => {
        if (err) {
          console.log(err);
        } else {
          console.info("%d stocks were saved", stocks.length);
        }
      });
    }
  });
};

const processMetaDataAllExchanges = async (results) => {
  const stocks = [];
  let temp = 0;
  const hash = {};
  results.map(async (result) => {
    const scrip = result["SCRIP"];
    console.log(scrip, result);
    const find = await Stock.find({ symbol: scrip });
    ++temp;
    if (find.length === 0 && hash[scrip] === undefined) {
      stocks.push({
        symbol: scrip,
        name: result.NAME,
        sector: result.SECTOR,
      });
      hash[scrip] = true;
    } else {
      console.log(find);
    }
    console.log("Loading " + temp);
    if (temp >= results.length) {
      console.log("Stocks", stocks.length);

      Stock.collection.insertMany(stocks, (err, docs) => {
        if (err) {
          console.log(err);
        } else {
          console.info("%d stocks were saved", docs.length);
        }
      });
    }
  });
};

router.post(
  "/securities/dump",
  upload.single("dump"),
  async (req, res, next) => {
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
  }
);

router.post(
  "/securities/meta",
  upload.single("meta"),
  async (req, res, next) => {
    const results = [];
    try {
      console.log(req.file);
      fs.createReadStream(req.file.path)
        .pipe(parse())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          processMetaDataAllExchanges(results);
        });
    } catch (err) {
      res.json({ message: err });
    }
  }
);

router.post("/securities/cron", async (req, res) => {
  findAllScrips();
});

const findAllScrips = async () => {
  const stocks = await Stock.find({});
  console.log(stocks.length);
  stocks.forEach((stock) => {
    cronWorker(stock.symbol, (html) => {
      const root = HTMLParser.parse(html);
      const rootString = root.toString();
      try {
        const finCodeString = 'var fincode = "';
        const indCodeString = 'var indCode = "';

        if (
          rootString.indexOf(finCodeString) !== -1 &&
          rootString.indexOf(indCodeString) !== -1
        ) {
          const finCode = rootString.split(finCodeString)[1].split('";')[0];
          const indCode = rootString.split(indCodeString)[1].split('";')[0];
          let peers = [];
          // const peerNodes = root.querySelectorAll('.similar_stock_item');
          // console.log(root.toString());
          // peerNodes.forEach((elem) => {
          //   const a = elem.querySelector('a');
          //   peers.push({
          //     symbol: a.href.split('/stock/')[1]
          //   })
          // });
          const getURL = `https://portal.tradebrains.in/getPeerCompanies?fincode=${finCode}&indCode=${indCode}`;
          request(
            getURL,
            {
              timeout: 3000,
            },
            (error, response, body) => {
              if (!error) {
                try {
                  const peerData = JSON.parse(body);
                  peers = peerData
                    .filter((d) => {
                      return d.symbol !== stock.symbol;
                    })
                    .map((d) => {
                      return { symbol: d.symbol };
                    });
                  const data = {
                    identifier: { symbol: stock.symbol.toString() },
                    peers,
                  };

                  console.log("Data", data);

                  const peerSchema = new StockPeerSchema(data);
                  peerSchema.save((err, result) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("Saved");
                    }
                  });
                } catch (err) {
                  console.log(stock.symbol);
                }
              }
            }
          );
        }
      } catch (err) {
        console.log(err);
      }
    });
  });
};

const cronWorker = (scrip, cb) => {
  const URI = `https://portal.tradebrains.in/stock/${scrip}/consolidated`;
  request(
    URI,
    {
      timeout: 5000,
    },
    (error, response, body) => {
      if (!error) {
        cb(body);
      }
    }
  );
};

module.exports = router;
