var VKontakteStrategy = require('passport-vkontakte').Strategy;
var passport = require('passport');
var secret = require('./secret');
var vkName = '';

passport.use( new VKontakteStrategy ({
        clientID:     secret.clientID,
        clientSecret: secret.clientSecret,
        callbackURL:  'http://localhost:1000/auth/vk/callback'
    },
    function (accessToken, refreshToken, profile, done) {
        vkName = profile.displayName;
    }
));

module.exports = {

    getVkName: function () {
        return vkName;
    },

    auth: function () {
        return passport.authenticate('vkontakte');
    }

};