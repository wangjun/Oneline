/* /actions */
var Q       = require('Q'),
    jwt     = require('jsonwebtoken'),
    router  = require('express').Router(),
    actions = require('./helper/actions');

var User          = require('../models/user').User,
    q_userFindOne = Q.nbind(User.findOne, User);


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

    if (Object.keys(validPassports).length === 0){
        next({ status: 401, message: 'No authorization token was found' })
    } else {
        req.olPassports = validPassports
        req.olId = {}
        next()
    }
})

router.post('/like', function (req, res, next){
    var provider = req.body.provider;

    q_userFindOne({id: provider + req.olPassports[provider]})
    .then(function (found){
        return actions[provider + '_like']({
            token      : found.token,
            tokenSecret: found.tokenSecret,
            id         : req.body.id
        })
    })
    .then(function (data){
        res.json({code: 200})
    }, function (err){
        console.log(err)
    })
})

module.exports = router