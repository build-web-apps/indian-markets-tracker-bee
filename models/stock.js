const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StockSchema = new Schema({
    symbol: {
        type: String,
        required: true,
        index: { unique: true }
    },
    sector: {
        type: String,
        required: false
    },
    isin: {
        type: String,
        required: true,
        index: { unique: true }
    },
    series: {
        type: String,
        required: true,
        index: { unique: true }
    }
});

module.exports = mongoose.model('stocks', StockSchema);