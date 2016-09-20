var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080
var User = require('./models/user.js');
var config = require('./config');
var io = require('socket.io');
var twilio = require('twilio');
var fs = require('fs');


app.use(morgan('dev'));
mongoose.connect(config.database);
database = mongoose.connection;
database.on('error', console.error.bind(console, 'connection error:'));
database.once('open', function() {

    console.log('Database Connected!');


});

function renderStrikes(data, done) {
  fs.readFile('./public/strikes.html', 'utf8', function (err, layout) {
    if (err) done(err);
    done(null, layout
        .replace('{{{body}}}', data.map(function (usr){
           return "<div>" + usr.name + "</div>";
         }).join(" ")));
  });
};



var client = new twilio.RestClient('AC89a67dfee64487e8b9fb7d422fbf7a3c', '8a6d97fe7463ed3ea18ab1b2a97c21e0');


app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET , POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-requested-With, content-type,');
    next();
});



//Basic Routes for API

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html')
})


app.get('/app', function(req,res){
  res.download(__dirname + '/BlueKeyApplication.docx')
})


app.get('/apply', function(req,res){
  res.sendFile(__dirname + '/app/home.html')
})
app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/public/home.html')


});


app.get('/register', function(req, res) {
    res.sendFile(__dirname + '/public/register.html')

});

app.get('/upNext', function(req, res) {
    res.sendFile(__dirname + '/public/upNext.html');


});



app.get('/attendanceMarked', function(req, res) {
    res.sendFile(__dirname + '/public/attendanceMarked.html')

    User.find({
        checkedOut: true
    }, 'name', function(err, User) {
        if (err) return handleError(err);
        console.log(User);
    });
});

app.get('/gaveTour', function(req, res) {
    res.sendFile(__dirname + '/public/gaveTour.html')

});

app.get('/deskTimes', function(req, res) {
    res.sendFile(__dirname + '/public/deskTimes.html')

});

app.get('/excuses', function(req, res) {
    res.sendFile(__dirname + '/public/excuses.html')
});

app.get('/strikes', function(req, res) {


    User.find({
        checkedIn: true,
        checkedOut: false
    }, 'name', function(err, users) {
        if (err) return handleError(err);
        renderStrikes(users, function(err, layout) {
          if (err) return handleError(err);
          res.send(layout);
        });
    });
});

app.post('/register', function(req, res) {

    var personEntered = new User();


    personEntered.name = req.param('personName'),
        personEntered.checkedIn = false;
    personEntered.checkedOut = false;
    personEntered.tours = 0;
    personEntered.desk = 0;
    personEntered.phone = 0;
    personEntered.bannerId = '';
    personEntered.updated = new Date;
    personEntered.save(function(err) {
        if (err) res.send(err);
        res.json({
            message: 'lib added' + req.param('personName')
        });


    });

});

app.post('/upNext', function(req, res) {
    var personEntered = new User();

    personEntered.name = req.param('personName');

    User.findOneAndUpdate({
        name: req.param('personName')
    }, {
        checkedIn: true,
        checkedOut: false
    }, function(err, user) {
        if (err) throw err;

    });

    User.findOne({
        name: req.param('personName')
    }, 'phone', function(err, User) {
        if (err) return handleError(err);

        //onsole.log(req.param('personName'));

        if (User != null) {
            client.sms.messages.create({
                to: User.phone,
                from: '8622775083',
                body: 'Hooray, you are next in the rotation. Please be 15 minutes early to your tour time!'
            }, function(error, message) {
                if (!error) {
                    console.log('Success! The SID for this SMS message is:');
                    console.log(message.sid);
                    console.log('Message sent on:');
                    console.log(message.dateCreated);
                } else {
                    console.log('Oops! There was an error.');
                }
            })
        };

    });

    User.find({
        checkedIn: true
    }, 'name', function(err, returnedUser) {
        if (err) return handleError(err);
        console.log(returnedUser);
        //shove user at top
        for (var i = 0; i < returnedUser.length; i++) {
        if (returnedUser[i].name === personEntered.name) {

            var me = returnedUser[i];
            returnedUser[i] = returnedUser[0];
            returnedUser[0] = me;

          }
        }

        //send our array back
        res.json(returnedUser);
    });


});

app.post('/attendanceMarked', function(req, res) {
    var personEntered = new User();

    personEntered.name = req.param('personName');

    if ((req.param('personName') || []).length > 30) {
        var enteredId = req.param('personName').split("^").pop().slice(12, 20);
        console.log(enteredId);
        User.findOneAndUpdate({
            bannerId: 'a' + enteredId
        }, {
            checkedIn: false,
            checkedOut: true
        }, function(err, doc) {
            if (!doc) {
                console.log("User does not exist");
            } else {
                console.log("User attendance recorded");
            }

        });

    } else

        User.findOneAndUpdate({
            name: req.param('personName')
        }, {
            checkedIn: false,
            checkedOut: true
        }, function(err, doc) {
            if (!doc) {
                console.log("User does not exist");
            } else {
                console.log("User attendance recorded");
            }

        });


    User.find({
        checkedIn: true
    }, 'name', function(err, User) {
        if (err) return handleError(err);
        res.json(User);
    });

});

app.post('/gaveTour', function(req, res) {
    var personEntered = new User();

    personEntered.name = req.param('personName');
    if (req.param('personName').length > 30) {
        var enteredId = req.param('personName').split("^").pop().slice(12, 20);
        console.log(enteredId);
        User.findOneAndUpdate({
            bannerId: 'a' + enteredId
        }, {
            $inc: {
                tours: +1
            }
        }, function(err, doc) {

            if (!doc) {
                console.log("User does not exist");
            } else {
                console.log("User tour recorded");
            }

        });

    } else
        User.findOneAndUpdate({
            name: req.param('personName')
        }, {
            $inc: {
                tours: +1
            }
        }, function(err, doc) {
            if (!doc) {
                console.log("User does not exist");
            } else {
                console.log("User attendance recorded");
            }

        });

});

app.post('/deskTimes', function(req, res) {
    var personEntered = new User();

    personEntered.name = req.param('personName');
    if (req.param('personName').length > 30) {
        var enteredId = req.param('personName').split("^").pop().slice(12, 20);
        console.log(enteredId);
        User.findOneAndUpdate({
            bannerId: 'a' + enteredId
        }, {
            $inc: {
                desk: +1
            }
        }, function(err, doc) {

            if (!doc) {
                console.log("User does not exist");
            } else {
                console.log("User desk recorded");
            }

        });
    } else
        User.findOneAndUpdate({
            name: req.param('personName')
        }, {
            $inc: {
                desk: +1
            }
        }, function(err, doc) {
            if (!doc) {
                console.log("User does not exist");
            } else {
                console.log("User attendance recorded");
            }

        });
});





var apiRouter = express.Router();



//register Routes
app.use('/api', apiRouter);


//start the server

app.listen(port);
console.log('Magic Happens on this port ' + port);
