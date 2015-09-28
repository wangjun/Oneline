var extend  = require('extend'),
    Twit    = require('twit'),
    Ig      = require('instagram-node').instagram(),
    request = require('request');

module.exports = {
    twitter: function (action, opts){

        var T = new Twit({
            consumer_key       : process.env.TWITTER_KEY,
            consumer_secret    : process.env.TWITTER_SECRET,
            access_token       : opts.token,
            access_token_secret: opts.tokenSecret
        });
        var q_twit = Q.nbind(T.post, T);

        // Init
        var tOpts = {}, action_str;

        if (action === 'like'){

            action_str = 'favorites/' + (opts.method === 'put' ? 'create' : 'destroy')
            extend(tOpts, { id: opts.id, include_entities: false })
        } else if (action === 'retweet'){

            action_str = 'statuses/' + (opts.method === 'put' ? 'retweet' : 'destroy')
            extend(tOpts, { id: opts.id, trim_user: true })
        } else if (action === 'tweet'){

            action_str = 'statuses/update'
            extend(tOpts, {
                status: opts.params.status,
                lat: opts.params.geo.lat,
                long: opts.params.geo.long,
                media_ids: opts.params.media_ids
            })
        }

        return q_twit(action_str, tOpts)
        .then(function (data){
            if (action === 'like'){
                return { statusCode: 200 }
            } else if (action === 'retweet'){
                return { statusCode: 200, id_str: data[0].id_str }
            } else if (action === 'tweet'){
                return { statusCode: 200 }
            }
        })
    },
    weibo: function (action, opts){

        var wOpts = { access_token: opts.token, id: opts.id }, action_str;

        if (action === 'like'){
            action_str = 'attitudes/' + (opts.method === 'put' ? 'create' : 'destroy')
        } else if (action === 'retweet'){
            action_str = 'statuses/' + (opts.method === 'put' ? 'repost' : 'destroy')
        } else if (action === 'star'){
            action_str = 'favorites/' + (opts.method === 'put' ? 'create' : 'destroy')
        }

        var deferred = Q.defer();

        request.post({
            url: 'https://api.weibo.com/2/' + action_str + '.json', 
            form: wOpts
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
                    deferred.resolve({ statusCode: 200 })
                }
            }
        })

        return deferred.promise;
    }
}

