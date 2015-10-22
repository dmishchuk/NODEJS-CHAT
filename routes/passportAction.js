var express = require('express.io');
var router = express();
var passport = require('passport');
var passportAuth = require('../vk-auth');

router.get('/auth/vkontakte', passportAuth.auth());

passport.serializeUser(function (user, done) {
    done(null, JSON.stringify(user));
});

passport.deserializeUser(function (data, done) {
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        logger.log('info', 'smth wrong with deserialize user');
        done(err)
    }
});


router.get('/auth/vk/callback',
    passport.authenticate('vkontakte'),
    function (req, res) {
        console.log(req.user);
    });

module.exports = router;

