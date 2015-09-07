var Twit    = require('Twit'),
    Ig      = require('instagram-node').instagram(),
    request = require('request');

module.exports = {
    t: function (opts){

        var T = new Twit({
            consumer_key       : process.env.TWITTER_KEY,
            consumer_secret    : process.env.TWITTER_SECRET,
            access_token       : opts.token,
            access_token_secret: opts.tokenSecret
        });
        var q_twit_timeline = Q.nbind(T.get, T);
        var tOpts = {
            include_entities: false,
            count: opts.count || 20
        };

        if (opts.since_id){
            tOpts.since_id = opts.since_id
        } else if (opts.max_id) {
            tOpts.max_id = opts.max_id
        }

        return q_twit_timeline('statuses/home_timeline', tOpts)

    },
    i: function (opts){
        Ig.use({ access_token : opts.token })
        var q_ig_timeline   = Q.nbind(Ig.user_self_feed, Ig);

        var iOpts = {
            count: opts.count || 20
        };

        if (opts.min_id){
            iOpts.min_id = opts.min_id
        } else if (opts.max_id){
            iOpts.max_id = opts.max_id
        }

        return q_ig_timeline(iOpts)
    },
    w: function (opts){
        var wOpts = {
            access_token: opts.token,
            count: opts.count || 20
        };

        if (opts.since_id){
            wOpts.since_id = opts.since_id
        } else if (opts.max_id) {
            wOpts.max_id = opts.max_id
        }

        var deferred = Q.defer();

        request({ 
            url: 'https://api.weibo.com/2/statuses/home_timeline.json',
            qs : wOpts
        }, function (err, res, body){
            if (err){
                deferred.reject(err)
            } else {
                var data;
                try {
                    data = JSON.parse(body)
                } catch (e) {
                    data = body
                } finally {
                    deferred.resolve(data)
                }
            }
        })

        return deferred.promise;
    }
}


