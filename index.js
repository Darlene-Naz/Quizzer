var express = require('express');
var session = require('express-session')
const bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
const Student = require('./models/student')
var User = require('./models/user');
var Topic = require('./models/topic');
var MCQ = require('./models/mcq');
var Subject = require('./models/subject');
var local = require('passport-local');
var path = require('path');
const axios = require('axios');
var passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/mcq-test', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

var app = express();

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);
app.use(session({
    secret: 'Dead girl in the pool',
    saveUninitialized: true,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true,
    resave: false,
    cookie: { maxAge: 60000 }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));


passport.use(new local(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============================================
//                  Routes
//============================================
app.get('/', function (req, res) {
    res.render('entry');
});

//--------------------------------------------
// const hashFunction = async () => {
//     const hashpwd = await bcrypt.hash(req.body.pwd, 8);

//     const student = new Student({ name: req.body.name, rollno: req.body.rollno, pwd: hashpwd })
//     student.save().then((student) => {
//         res.redirect('/subject?isStudent=' + 1);
//     }).catch((e) => {

//         res.redirect('/student');
//     })
// }
// hashFunction();



// app.get('/student/:id', (req, res) => {//not used
//     const _id = req.params.id

//     Student.findById(_id).then((user) => {
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     }).catch((e) => {
//         res.status(500).send(e)
//     })
// })


//-------------------REGISTER--------------------------

app.get('/register_student', (req, res) => {
    res.render('register_student')
});

app.post('/register_student', (req, res) => {

    console.log(req.body.username)

    User.register(new User({
        username: req.body.username,
        branch: req.body.branch,
        year: req.body.year,
        type: 'student'

    }), req.body.password, function (err, user) {
        if (err) {
            console.log("in student registeration err");
            console.log(err);
            return res.redirect('/register_student');
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/login_student');//to make
        });
    })
});

app.get('/register_teacher', function (req, res) {
    res.render('register_teacher')
});

app.post('/register_teacher', function (req, res) {
    req.body.username
    req.body.password

    User.register(new User({
        username: req.body.username,
        branch: req.body.branch,
        type: 'teacher'
    }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('register_teacher');
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/login_teacher');
        });
    });
});

//-----------------------LOGIN--------------------------
app.get('/login_teacher', function (req, res) {
    res.render('login_teacher');
});
app.get('/login_student', function (req, res) {
    res.render('login_student');
});

app.post('/login_teacher', passport.authenticate('local', {
    successRedirect: '/subject',
    failureRedirect: '/login_teacher'
}), function (req, res) {

});

app.post('/login_student', passport.authenticate('local', {
    successRedirect: '/subject',
    failureRedirect: '/login_student'
}), function (req, res) {

});
//---------------------------------------------------

app.get('/subject', isLoggedIn, function (req, res) {
    console.log(req.user);

    if (req.user.type == "teacher") {
        User.findById(req.user._id).populate('subject').exec(function (err, user) {
            if (err) {
                console.log(err);
            } else {
                res.render('subjects', { subjects: user.subject, req: req });
            }
        });
    } else if (req.user.type == "student") {
        Subject.find({ branch: req.user.branch, year: req.user.year }).populate('topics').exec(function (err, subject) {
            if (err) {
                console.log(err);
            } else {

                res.render('subjects', { subjects: subject, req: req });

            }
        });

    }


});

app.get('/subject/newsub', function (req, res) {
    res.render('newsub')
});

app.post('/subject', function (req, res) {
    var subjectName = req.body.subjectName;
    var newSubject = {
        subjectName: subjectName,
        branch: req.body.branch,
        year: req.body.year
    };
    Subject.create(newSubject, function (err, newSubject) {
        if (err) {
            console.log(err);
        } else {
            console.log("1" + req.user);
            req.user.subject.push(newSubject);
            req.user.save();
            console.log("2" + req.user);
            console.log(newSubject);
            res.redirect('/subject');
        }
    })
});


app.get('/subject/:id/topic', isLoggedIn, function (req, res) {

    Subject.findById(req.params.id).populate('topics').exec(function (err, foundSubject) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundSubject)
            res.render('topics', {
                subject: foundSubject, req: req
            });
        }
    });


});

app.get('/subject/:id/topic/newtopic', isLoggedIn, function (req, res) {
    Subject.findById(req.params.id, function (err, subject) {
        if (err) {
            console.log(err);
        } else {
            res.render('newtopic', { subject: subject })
        }
    })
});

app.post('/subject/:id/topic', function (req, res) {
    Subject.findById(req.params.id, function (err, subject) {
        if (err) {
            console.log(err);
            res.redirect('/subject');
        } else {

            Topic.create(req.body.topic, function (err, topic) {
                if (err) {
                    console.log(err);
                } else {
                    subject.topics.push(topic);
                    subject.save();
                    res.redirect('/subject/' + subject._id + '/topic');
                }
            });

        }
    });
});

app.get('/topic/:id2', isLoggedIn, function (req, res) {
    Topic.findById(req.params.id2).populate('mcqs').exec(function (err, foundTopic) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundTopic);
            res.render('mcq', { topic: foundTopic })
        }
    })
});

app.get('/quizup/:id2', isLoggedIn, function (req, res) {
    Topic.findById(req.params.id2).populate('mcqs').exec(function (err, foundTopic) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundTopic);
            res.render('QuizUp', { topic: foundTopic });
        }
    })
});

app.get('/topic/:id2/new', isLoggedIn, function (req, res) {
    Topic.findById(req.params.id2, function (err, topic) {
        if (err) {
            console.log(err);
        } else {
            res.render('quiz-maker.html', { topic: topic });
        }
    })
});

app.post('/quizup/:id2', isLoggedIn, function (req, res) {
    Topic.findById(req.params.id2).populate('mcqs').exec(
        function (err, topic) {
            if (err) {
                console.log(err);
            } else {
                var marks = 0;
                var answers = req.body.answers;
                for (var i = 0; i < topic.mcqs.length; i++) {
                    if (topic.mcqs[i].answer == answers[i]) {
                        marks = marks + 10;
                    }
                }
                console.log("rollno" + req.user.username);
                console.log("marks" + marks);
                var students_perf = {
                    username: req.user.username,
                    marks: marks
                };
                topic.performance.push(students_perf);
                topic.save();
            }
        }
    )
});

app.post('/topic/:id2', function (req, res) {

    Topic.findById(req.params.id2, function (err, topic) {

        if (err) {
            console.log(err);
            res.redirect("/topic");
        } else {

            MCQ.create(req.body.Qset, function (err, mcq) {
                if (err) {
                    console.log(err);
                } else {
                    var Qset = req.body.Qset;

                    for (var i = 0; i < Qset.length; i++) {
                        topic.mcqs.push(mcq[i]);
                    }
                    topic.save();
                    res.redirect('/topic/' + topic._id);
                }
            });
        }
    });
});


// ---------------------------------------------------
app.get('/subject/:id/topic', function (req, res) {
    Subject.findById(req.params.id).populate('topics').exec(function (err, foundSubject) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundSubject)
            //render show template with that campground
            res.render('topics', { subject: foundSubject });
        }
    });
});

app.get('/topic/newtopic', function (req, res) {
    res.render('newtopic');

});

app.post('subject/:id/topic', function (req, res) {
    var topicName = req.body.topicName;
    var marks = req.body.marks;
    var newTopic = { topicName: topicName, marks: marks };
    Topic.create(newTopic, function (err, newTopic) {
        if (err) {
            console.log(err);
        } else {
            console.log(newTopic);
            res.redirect('subject/:id/topic');
        }
    })
});

app.get('subject/:id/topic/:id', function (req, res) {
    Topic.findById(req.params.id).populate('mcqs').exec(function (err, foundTopic) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundTopic)
            res.render('mcq', { topic: foundTopic });
        }
    });
});

app.get('/topic/:id/mcq/new', function (req, res) {
    Topic.findById(req.params.id, function (err, topic) {
        if (err) {
            console.log(err);
        } else {
            res.render('mcqform', { topic: topic });
        }
    })
});


app.get('/quiz', isLoggedIn, function (req, res) {
    res.render('quiz');
});

//-----------------------------------------------

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
// -----------------------------------------------------------
// app.get('/forgot', function (req, res) {
//     res.render('forgot');
// });

// app.post('/forgot', (req, res) => {
//     req.body.rollno
//     req.body.password

//     const hashFunction = async () => {
//         const hashpwd = await bcrypt.hash(req.body.password, 8);

//         User.findOneAndUpdate({ username: req.body.rollno }, { password: hashpwd }, function (err, doc) {
//             if (err) return res.send(500, { error: err });
//             res.redirect('/login');
//         });
//     }
//     hashFunction();
// })

// -----------------------------------------------------

app.listen(8000, function (req, res) {
    console.log('Server is listening!');
});