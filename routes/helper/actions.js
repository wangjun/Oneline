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
        var tOpts = { id: opts.id }, action_str;

        if (action === 'like'){

            action_str = 'favorites/' + (opts.method === 'put' ? 'create' : 'destroy')
            extend(tOpts, { include_entities: false })
        } else if (action === 'retweet'){

            action_str = 'statuses/' + (opts.method === 'put' ? 'retweet' : 'destroy')
            extend(tOpts, { trim_user: true })
        }

        return q_twit(action_str, tOpts)
        .then(function (data){
            if (action === 'like'){
                return { code: 200 }
            } else if (action === 'retweet'){
                return { code: 200, id_str: data[0].id_str, retweet_count: data[0].retweet_count }
            }
        })
    },
    weibo: function (action, opts){

        var wOpts = { access_token: opts.token, id: opts.id }, action_str;

        if (action === 'like'){
            action_str = 'favorites/' + (opts.method === 'put' ? 'create' : 'destroy')
        } else if (action === 'retweet'){
            action_str = 'statuses/' + (opts.method === 'put' ? 'repost' : 'destroy')
        }

        var deferred = Q.defer();

        request.post({
            url: 'https://api.weibo.com/2/' + action_str + '.json', 
            form: wOpts
        }, function (err, res, body){
            if (err || res.statusCode !== 200){
                deferred.reject(err)
            } else {

                var data, resObj;

                try {
                    data = JSON.parse(body)
                } catch (e) {
                    data = body
                } finally {

                    if (action === 'like'){
                        resObj = { code: 200 }
                    } else if (action === 'retweet'){
                        resObj = {
                            code: 200,
                            id_str: data.idstr
                        }
                    }

                    deferred.resolve(resObj)
                }
            }
        })

        return deferred.promise;
    }
}

