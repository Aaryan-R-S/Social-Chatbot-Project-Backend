const mongoose = require('mongoose');
const { Schema } = mongoose;

const VideoSchema = new Schema({
    link:{
        type: String,
        required: true,
        unique: true
    }, 
    tags:{ 
        type: Array,
        items: { type: String, uniqueItems: true }
    },
});

module.exports = mongoose.model('video', VideoSchema);