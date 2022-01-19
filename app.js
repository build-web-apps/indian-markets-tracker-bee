const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");

const stocksRoute = require("./routes/stocks");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/stocks", stocksRoute);

app.get("/", (req, res) => {
  res.send("We are ready");
});

const URI = process.env.DB_CONNECT;

mongoose.connect(URI)
  .then(client => {
    console.log('Connected to Cluster is successful');
  })
  .catch(error => console.error(error));

  app.listen(3000);