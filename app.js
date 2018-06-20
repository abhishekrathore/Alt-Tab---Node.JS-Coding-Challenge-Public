'use strict';

let express = require('express');
let app = express();


app.use(express.static("app_client"));

/* Your code */
const CONFIG = require('./app.config'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    jwt = require('jsonwebtoken'),
    User = require('./schemas/UserSchema'),
    body_parser = require('body-parser');

mongoose.connect(CONFIG.DATABASE_URL).then(function () {
    console.log('success connect mongo db')
    require('./passport')(passport, User);
}, function (error) {
    console.log('error connect mongo db', error)
});
app.use(body_parser.urlencoded({
    extended: true
}));
app.use(body_parser.json());
app.post("/api/login", function (req, res) {
    passport.authenticate('local', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(400).send(err || 'Something is not right');;
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                return res.status(400).send(err || 'Something is not right');
            }
            // generate a signed son web token with the contents of user object and return it in the response
            const token = jwt.sign({
                id: user._id
            }, 'your_jwt_secret');
            return res.status(200).json({ token: token });
        });
    })(req, res);
});
app.post("/api/register", function (req, res) {
    console.log(req.body)
    //req.body.email = req.body.email.toLowerCase()
    User.findOne({ 'email': req.body.email }).
        exec(function (err, user) {
            if (err)
                return res.status(400).send("Error by database");
            if (user)
                return res.status(400).send("User already exist");
            var new_user = new User(req.body);
            new_user.generateHash(req.body.password);
            new_user.save(function (err, user) {
                if (err) {
                    return res.status(400).send("Error by database");
                } else {
                    const token = jwt.sign({
                        id: user._id
                    }, 'user_maagement_key');
                    return res.status(201).json({
                        msg: "Register successfully",
                        user: user,
                        token: token
                    });
                }
            });
        });
});
app.post("/api/logout", passport.authenticate('jwt', { session: false }), function (req, res) {
    if (req.user) {
        req.logout();
        res.json({
            msg: 'Successfully logout by user',
        });
    } else {
        res.json({
            msg: 'Successfully logout',
        });
    }
});

app.get("/api/profile", passport.authenticate('jwt', { session: false }), function (req, res) {
    if (!req.user) {
        return res.status(401).send(err || 'User unauth');;
    }
    res.status(200).json(req.user);
});

app.listen(8080, function () {
    console.log("server started")
})
module.exports = app;
