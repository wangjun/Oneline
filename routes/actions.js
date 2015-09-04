/* /actions */
var Q       = require('Q'),
    router  = require('express').Router(),
    actions = require('./helper/actions');

var User          = require('../models/user').User,
    q_userFindOne = Q.nbind(User.findOne, User);

// Handing `action` & `provider` & `id` Params
router.param('action', function (req, res, next, action){

    req.olAction = action

    next()
})
router.param('provider', function (req, res, next, provider){

    req.olProvider = provider

    next()
})
router.param('id', function (req, res, next, id){

    req.olId = id

    next()
})

router.all('/:action/:provider/:id', function (req, res, next){
    var provider = req.olProvider;

    q_userFindOne({ id: provider + req.olPassports[provider] })
    .then(function (found){

        return actions[provider](req.olAction, {

            token      : found.token,
            tokenSecret: found.tokenSecret,
            id         : req.olId,
            method     : req.method.toLowerCase()

        })
    })
    .then(function (data){
        res.json(data)
    })
    .fail(function (err){
        next(err)
    })
})

module.exports = router