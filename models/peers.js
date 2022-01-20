const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StockSymbolSchema = new Schema({
    symbol: {
        type: String,
        required: true
    }
})

const StockPeerSchema = new Schema({
    identifier: StockSymbolSchema,
    peers: [StockSymbolSchema]
});

module.exports = mongoose.model('stockPeers', StockPeerSchema);