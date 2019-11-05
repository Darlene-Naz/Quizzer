var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    type: { type: String },
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 4,
        trim: true
    },
    branch: {
        type: String,
        required: true
    },
    subject: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ],
    year: String,
    type: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);