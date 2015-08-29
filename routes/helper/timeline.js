var Q = require('q'),
    Twit   = require('Twit'),
    Ig     = require('instagram-node').instagram();


module.exports = {
    t: function (token, tokenSecret){

        var T = new Twit({
                consumer_key       : process.env.TWITTER_KEY,
                consumer_secret    : process.env.TWITTER_SECRET,
                access_token       : token,
                access_token_secret: tokenSecret
        });
        var q_twit_timeline = Q.nbind(T.get, T);

        return q_twit_timeline('statuses/home_timeline', { include_entities: true })

    },
    i: function (token){
        Ig.use({
            client_id    : process.env.INSTAGRAM_KEY,
            client_secret: process.env.INSTAGRAM_SECRET,
            access_token : token
        })
        var q_ig_timeline   = Q.nbind(Ig.user_self_feed, Ig);

        return q_ig_timeline()
    }
}


