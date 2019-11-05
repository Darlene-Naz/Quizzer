var mongoose = require('mongoose');

var subjectSchema = new mongoose.Schema({
    subjectName: String,
    branch: String,
    year: String,
    topics: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic'
        }
    ]
});

module.exports = mongoose.model('Subject', subjectSchema);