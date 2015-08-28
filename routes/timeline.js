/* /timeline */
var Q      = require('Q'),
    jwt    = require('jsonwebtoken'),
    Twit   = require('Twit'),
    Ig     = require('instagram-node').instagram(),
    router = require('express').Router(),
    filter = require('./helper/filter.js');

var User            = require('../models/user').User,
    q_userFindOne   = Q.nbind(User.findOne, User);


// 保護 endpoints
router.use(function (req, res, next){
    var tokenList = req.headers.authorization && JSON.parse(req.headers.authorization.split(' ')[1]) || [],
        validPassports = {};

    // 提取有效 token 的 payload 到 req.olPassports
    tokenList.forEach(function (token, index){
        try {
            var decoded = jwt.verify(token, process.env.KEY)
            validPassports[decoded.provider] = decoded.userId
        } catch (e){}
    })

    if (validPassports.length === 0){
        next({ status: 401, message: 'No authorization token was found' })
    } else {
        req.olPassports = validPassports
        next()
    }
})

// router.param('id', function (req, res, next, id){
//     console.log('+++++++++++++++++++', id)
//     next()
// })
router.get(['/', '/:id'], function (req, res, next){

    Q.all([
        q_userFindOne({id: 'twitter' + req.olPassports.twitter}),
        q_userFindOne({id: 'instagram' + req.olPassports.instagram})
    ])
    .spread(function (twit, ig){
        Ig.use({
            access_token: ig.token,
            client_id: process.env.INSTAGRAM_KEY,
            client_secret: process.env.INSTAGRAM_SECRET
        })
        var T = new Twit({
                consumer_key       : process.env.TWITTER_KEY,
                consumer_secret    : process.env.TWITTER_SECRET,
                access_token       : twit.token,
                access_token_secret: twit.tokenSecret
            }),
            q_twit_timeline = Q.nbind(T.get, T),
            q_ig_timeline   = Q.nbind(Ig.user_self_feed, Ig);

        return Q.all([
            q_twit_timeline('statuses/home_timeline', { include_entities: true }),
            q_ig_timeline()
        ])

    })
    .spread(function (tData, iData){
        require('fs')
        .writeFileSync(process.env.PWD + '/ignore/data-twitter.json', JSON.stringify(tData[0], null, 4))

        require('fs')
        .writeFileSync(process.env.PWD + '/ignore/data-instagram.json', JSON.stringify(iData[0], null, 4))

        var combineData = filter.tweet(tData[0]).concat(filter.igPost(iData[0]))
        res.json(combineData)
    })
    .fail(function (err){
        console.log(err)
    })
})


module.exports = router