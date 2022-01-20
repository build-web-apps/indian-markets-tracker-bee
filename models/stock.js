const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StockSchema = new Schema({
    name: {
        type: String
    },
    faceValue: {
        type: Number
    },
    dateOfListing: {
        type: String
    },
    symbol: {
        type: String,
        required: true,
        index: { unique: true }
    },
    sector: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('stocks', StockSchema);