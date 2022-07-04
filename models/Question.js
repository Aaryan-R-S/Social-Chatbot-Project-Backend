const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuestionSchema = new Schema({
    uniqueid:{
        type: String,
        required: true,
        unique: true
    }, 
    text:{
        type: String,
        required: true
    },
    answers:{ 
        type: Array,
        items: { type: String, uniqueItems: true }
    },
    nextquestions:{ 
        type: Array,
        items: { type: String }
    },
    suggestions:{ 
        type: Array,
        items: { type: String }
    },
    videos:{ 
        type: Array,
        items: { type: mongoose.Schema.Types.ObjectId, ref: 'video' }
    },
});

module.exports = mongoose.model('question', QuestionSchema);