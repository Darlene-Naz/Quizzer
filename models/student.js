var mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose');
// const validator = require('validator')

var studentSchema = new mongoose.Schema({

    // userType: { type: String, default: 'student' },

    username: {
        type: String,
        required: true,
        trim: true
    },
    rollno: {
        type: Number,
        required: true,
        trim: true,
        unique: true,//throws code:11000 if violated duplicate key error
        validate(value) {
            if (!/^[0-9]{4}$/.test(value)) {
                throw new Error('Invalid roll no')
            }
        }
    },
    pwd: {
        type: String,
        minlength: 4,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    }
});

// const me = new Student({
//     name: 'Json',
//     rollno: 8333,
//     pwd: 'qwerty'

// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log(error)
// })
studentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Student', studentSchema);