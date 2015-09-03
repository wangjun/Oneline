/* /actions */
var Q       = require('Q'),
    router  = require('express').Router(),
    actions = require('./helper/actions');

var User          = require('../models/user').User,
    q_userFindOne = Q.nbind(User.findOne, User);

// Handing `provider` & `id` Params
router.param('provider', function (req, res, next, provider){

    req.olProvider = provider

    next()
})
router.param('id', function (req, res, next, id){

    req.olId = id

    next()
})

// Like
router.all('/like/:provider/:id', function (req, res, next){
    var provider = req.olProvider;

    q_userFindOne({id: provider + req.olPassports[provider]})
    .then(function (found){
        return actions[provider + '_like']({
            token      : found.token,
            tokenSecret: found.tokenSecret,
            id         : req.olId,
            action     : req.method.toLowerCase()
        })
    })
    .then(function (data){
        res.json({code: 200})
    }, function (err){
        next(err)
    })
})

module.exports = router