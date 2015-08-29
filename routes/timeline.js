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
        var feedPromises = [];

        if (twit){
            feedPromises.push(feed.t(twit.token, twit.tokenSecret))
        }

        if (ig){
            feedPromises.push(feed.i(ig.token))
        }

        return Q
        .all(feedPromises)
        .spread(function (tData, iData){
            var combineData = [];

            if (tData){
                require('fs')
                .writeFileSync(process.env.PWD + '/ignore/data-twitter.json', JSON.stringify(tData[0], null, 4))

                combineData = combineData.concat(filter.tweet(tData[0]))
            }

            if (iData){
                require('fs')
                .writeFileSync(process.env.PWD + '/ignore/data-instagram.json', JSON.stringify(iData[0], null, 4))

                combineData = combineData.concat(filter.igPost(iData[0]))
            }

            res.json(combineData)
        })
    })
    .fail(function (err){
        console.log(err)
    })
})


module.exports = router