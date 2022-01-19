const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SampleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    space: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    access: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('listingsAndReviews', SampleSchema);