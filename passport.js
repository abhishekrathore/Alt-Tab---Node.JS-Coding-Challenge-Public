(function () {
    'use strict';
    const passportJWT = require("passport-jwt");
    const LocalStrategy = require("passport-local");
    const JWTStrategy = passportJWT.Strategy;
    const ExtractJWT = passportJWT.ExtractJwt;
    module.exports = function (passport, User) {
        passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
            function (email, password, done) {
                console.log(email)
                return User.findOne({ email})
                    .exec(function (err, user) {
                        console.log(user)
                        if (err)
                            return done(err);
                        if (!user)
                            return done('No user found.' );
                        if (!user.validPassword(password))
                            return done('Oops! Wrong password.');
                        return done(null, user);
                    });
            }
        ));
        passport.use(new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'your_jwt_secret'
        },
            function (jwtPayload, done) {
                console.log('jwtPayload', jwtPayload)
                return User.findById(jwtPayload.id)
                    .exec(function (err, user) {
                        if (err)
                            return done(err);
                        if (!user)
                            return done('No user found.');
                        return done(null, user);
                    });
            }
        ));
    }
})();