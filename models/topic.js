var mongoose = require('mongoose');

var topicSchema = new mongoose.Schema({
    topicName: String,
    performance: [
        {
            username: String,
            marks: Number
        }
    ],
    marks: Number,
    mcqs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MCQ'
        }
    ]
});

module.exports = mongoose.model('Topic', topicSchema);