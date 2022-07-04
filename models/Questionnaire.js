const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuestionnaireSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    questionanswers:{ 
        type: Array,
        items: { 
            questionid:{ type: String, required: true},
            answer:{ type: String, required: true},
            date:{ type: Date, default: Date.now}, 
        }
    },
});

module.exports = mongoose.model('questionnaire', QuestionnaireSchema);