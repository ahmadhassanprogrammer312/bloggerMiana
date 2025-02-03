const { reference } = require('@popperjs/core');
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookName: String,
    authorName: String,
    researcherName: String,
    publisherName: String,
    description: String,
    imageUrl: String,
    totalPages: Number,
    category: String,
    pdfUrl: String,
    reactions: {
        like: [{
            type: Number,
            default: 0
        }],
        dislike: [{
            type: Number,
            default: 0
        }],
        share: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: 0
        }],
    },
    views: {
        type: Number,
        default: 0
    },

});

module.exports = mongoose.model('book', bookSchema);