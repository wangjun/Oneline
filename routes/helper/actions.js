var Q      = require('q'),
    Twit   = require('Twit'),
    Ig     = require('instagram-node').instagram();


module.exports = {
    twitter_like: function (opts){

        var T = new Twit({
            consumer_key       : process.env.TWITTER_KEY,
            consumer_secret    : process.env.TWITTER_SECRET,
            access_token       : opts.token,
            access_token_secret: opts.tokenSecret
        });
        var q_twit_like = Q.nbind(T.post, T);

        var tOpts = {
            id: opts.id,
            include_entities: false
        }

        return q_twit_like('favorites/create', tOpts)

    },
    instagram_like: function (opts){
        Ig.use({
            client_id    : process.env.INSTAGRAM_KEY,
            client_secret: process.env.INSTAGRAM_SECRET,
            access_token : opts.token
        })
        var q_add_like  = Q.nbind(Ig.add_like, Ig);

        return q_add_like(opts.id)
    }
}