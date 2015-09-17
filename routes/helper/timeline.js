var Twit    = require('twit'),
    Ig      = require('instagram-node').instagram(),
    request = require('request');

module.exports = {
    twitter: function (opts){
        var T = new Twit({
            consumer_key       : process.env.TWITTER_KEY,
            consumer_secret    : process.env.TWITTER_SECRET,
            access_token       : opts.token,
            access_token_secret: opts.tokenSecret
        });
        var q_twit_get = Q.nbind(T.get, T);
        var tOpts = {
            include_entities: false,
            count: opts.count || 20
        };

        if (opts.since_id){
            tOpts.since_id = opts.since_id
        } else if (opts.max_id) {
            tOpts.max_id = opts.max_id
        }

        return q_twit_get('statuses/home_timeline', tOpts)
        .then(function (data){
            return data
        }, function (err){
            if (err.statusCode === 429){
                return q_twit_get('application/rate_limit_status', { resources: ['statuses'] })
                .then(function (data){
                    throw {
                        statusCode: 429,
                        message: 'Rate limit exceeded',
                        reset: data[0].resources.statuses['/statuses/home_timeline'].reset
                    }
                }, function (err){
                    throw err
                })
            }
        })

    },
    instagram: function (opts){
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
    weibo: function (opts){
        var wOpts = {
            access_token: opts.token,
            count: opts.count || 50
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
            if (err || res.statusCode !== 200){
                deferred.reject(err || { statusCode: res.statusCode })
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


