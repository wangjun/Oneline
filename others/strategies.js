var User            = require('../models/user').User,
    TwitterStrategy = require('passport-twitter').Strategy,
    InstagramStrategy = require('passport-instagram').Strategy;


module.exports = function (passport){

// Twitter
passport.use(new TwitterStrategy({
    'consumerKey'   : process.env.TWITTER_KEY,
    'consumerSecret': process.env.TWITTER_SECRET,
    'callbackURL'   : process.env.TWITTER_CB_URL
}, function (token, tokenSecret, profile, done){

    var id = profile.provider + profile.id;

    User.findOne({id: id}, function (err, found){
        if (err) return done(err)
        if (found){
            done(null, found)
        } else {
            var user = new User({
                'id'         : id,
                'userId'     : profile.id + '',
                'displayName': profile.displayName,
                'provider'   : profile.provider,
                'token'      : token,
                'tokenSecret': tokenSecret
            })
            user.save(function (err){
                if (err) return done(err)
                done(null, user)
            })
        }
    })

}))

// Instagram
passport.use(new InstagramStrategy({
    'clientID'    : process.env.INSTAGRAM_KEY,
    'clientSecret': process.env.INSTAGRAM_SECRET,
    'callbackURL' : process.env.INSTAGRAM_CB_URL
}, function (accessToken, refreshToken, profile, done){

    var id = profile.provider + profile.id;
    User.findOne({id: id}, function (err, found){
        if (err) return done(err)
        if (found){
            done(null, found)
        } else {
            var user = new User({
                'id'         : id,
                'userId'     : profile.id + '',
                'displayName': profile.displayName,
                'provider'   : profile.provider,
                'token'      : accessToken,
                'refreshToken': refreshToken
            })
            user.save(function (err){
                if (err) return done(err)
                done(null, user)
            })
        }
    })

}))

}
