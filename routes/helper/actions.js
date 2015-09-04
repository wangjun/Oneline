var Q      = require('q'),
    extend = require('extend'),
    Twit   = require('Twit'),
    Ig     = require('instagram-node').instagram();


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
    }
}
