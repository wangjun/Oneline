/* /timeline */
var Q      = require('Q'),
    jwt    = require('jsonwebtoken'),
    router = require('express').Router(),
    filter = require('./helper/filter'),
    feed   = require('./helper/timeline');

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
        req.olId = {}
        next()
    }
})

// Handing `id` Params
router.param('id', function (req, res, next, id){
    var olIdObj   = {},
        arrayOfId = id.split(',');

    arrayOfId.forEach(function (id_str){
        var key   = id_str.split('-')[0],
            value = id_str.split('-')[1];

        olIdObj[key] = value
    })

    req.olId = olIdObj

    next()
})
// Handing `count` Params
router.param('count', function (req, res, next, count){

    req.olCount = count

    next()
})

// Init Load
router.get('/', function (req, res, next){

    Q.all([
        q_userFindOne({id: 'twitter' + req.olPassports.twitter}),
        q_userFindOne({id: 'instagram' + req.olPassports.instagram})
    ])
    .spread(function (twit, ig){
        var feedPromises = [];

        if (twit){
            feedPromises.push(feed.t({
                token      : twit.token,
                tokenSecret: twit.tokenSecret
            }))
        }

        if (ig){
            feedPromises.push(feed.i({
                token : ig.token
            }))
        }

        return Q.all(feedPromises)
    })
    .spread(handleData(req, res, next))
    .fail(function (err){
        console.log(err)
        next({})
    })
})

// Load More
router.get('/:id/:count', function (req, res, next){

    Q.all([
        q_userFindOne({id: 'twitter' + req.olPassports.twitter}),
        q_userFindOne({id: 'instagram' + req.olPassports.instagram})
    ])
    .spread(function (twit, ig){
        var feedPromises = [];

        if (twit && (req.olId.twitter_minId || req.olId.twitter_maxId)){
            feedPromises.push(feed.t({
                token      : twit.token,
                tokenSecret: twit.tokenSecret,
                since_id   : req.olId.twitter_minId,
                max_id     : req.olId.twitter_maxId,
                count      : req.olCount
            }))
        }

        if (ig && (req.olId.instagram_minId || req.olId.instagram_maxId)){
            feedPromises.push(feed.i({
                token : ig.token,
                min_id: req.olId.instagram_minId,
                max_id: req.olId.instagram_maxId,
                count : req.olCount
            }))
        }

        return Q.all(feedPromises)
    })
    .spread(handleData(req, res, next))
    .fail(function (err){
        console.log(err)
        next({})
    })
})

function handleData(req, res, next){
    return function (tData, iData){
        var combineData = {
            data    : [],
            min_id  : {},
            min_date: {}
        };

        if (tData){

            var tData = filter.tweet(tData[0]);

            combineData.min_id.twitter = tData.min_id
            combineData.min_date.twitter = tData.min_date

            combineData.data = combineData.data.concat(tData.data)
        }

        if (iData){

            var iData = filter.igPost(iData[0]);

            combineData.min_id.instagram = iData.min_id
            combineData.min_date.instagram = iData.min_date

            combineData.data = combineData.data.concat(iData.data)
        }

        res.json(combineData)
    }
}

module.exports = router