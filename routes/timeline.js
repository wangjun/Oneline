/* /timeline */
var Q      = require('Q'),
    jwt    = require('jsonwebtoken'),
    Twit   = require('Twit'),
    router = require('express').Router();

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
    console.log(req.olPassports)
    q_userFindOne({id: 'twitter' + req.olPassports.twitter})
    .then(function (found){
        var config = {
            consumer_key       : process.env.TWITTER_KEY,
            consumer_secret    : process.env.TWITTER_SECRET,
            access_token       : found.token,
            access_token_secret: found.tokenSecret
        }
        // new Twit(config).get('statuses/home_timeline', function (err, data){
        //     if(err) console.log(err)
        //     res.json(data)
        // })
        var file = require('fs').readFileSync(process.env.PWD + '/ignore/data-instagram.json', 'utf-8')
        res.json(JSON.parse(file))
    })
    .fail(function (err){
        console.log(err)
    })
})


module.exports = router