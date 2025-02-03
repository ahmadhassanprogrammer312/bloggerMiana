const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    
    date: {
        type: Date,
        default: Date.now
    },
    titleContent: {
        type:String,
        // required: true
    },
    body: {
        type:String,
        required: true
    },
    featureImageUrl: String,
    category: {
        type: String,
        default: "Uncategorized",
        required: true
    },
    tags: [
        {
            type: String
        }
    ],
    
    views: {
        type: Number,
        default: 0
    },


    
});


module.exports = mongoose.model('post', postSchema);