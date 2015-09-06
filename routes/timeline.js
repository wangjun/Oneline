/* /timeline */
var router = require('express').Router(),
    filter = require('./helper/filter'),
    feed   = require('./helper/timeline');


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
            feedPromises[0] = feed.t({
                token      : twit.token,
                tokenSecret: twit.tokenSecret
            })
        }

        if (ig){
            feedPromises[1] = feed.i({
                token : ig.token
            })
        }

        return Q.all(feedPromises)
    })
    .spread(handleData(req, res, next))
    .fail(function (err){
        console.log(err.stack)
        next(err)
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
            feedPromises[0] = feed.t({
                token      : twit.token,
                tokenSecret: twit.tokenSecret,
                since_id   : req.olId.twitter_minId,
                max_id     : req.olId.twitter_maxId,
                count      : req.olCount
            })
        }

        if (ig && (req.olId.instagram_minId || req.olId.instagram_maxId)){
            feedPromises[1] = feed.i({
                token : ig.token,
                min_id: req.olId.instagram_minId,
                max_id: req.olId.instagram_maxId,
                count : req.olCount
            })
        }

        return Q.all(feedPromises)
    })
    .spread(handleData(req, res, next))
    .fail(function (err){
        console.log(err)
        next(err)
    })
})

function handleData(req, res, next){
    return function (tData, iData){

        var combineData = {
            data    : [],
            min_id  : {},
            min_date: {},
            max_id  : {},
            max_date: {}
        };

        if (tData){

            var tData = filter.tweet(tData[0]);

            combineData.min_id.twitter = tData.min_id
            combineData.min_date.twitter = tData.min_date
            combineData.max_id.twitter = tData.max_id
            combineData.max_date.twitter = tData.max_date

            combineData.data = combineData.data.concat(tData.data)
        }

        if (iData){

            var iData = filter.igPost(iData[0]);

            combineData.min_id.instagram = iData.min_id
            combineData.min_date.instagram = iData.min_date
            combineData.max_id.instagram = iData.max_id
            combineData.max_date.instagram = iData.max_date

            combineData.data = combineData.data.concat(iData.data)
        }

        res.json(combineData)
    }
}

module.exports = router