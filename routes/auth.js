/* /auth */
var passport = require('passport'),
    jwt      = require('jsonwebtoken'),
    router   = require('express').Router();


// Twitter
router.get('/twitter', passport.authenticate('twitter', { session: false }))
router.get('/twitter/callback', passport.authenticate('twitter', {
    session: false
}), function (req, res){

    var token = jwt.sign({
        'provider' : req.user.provider,
        'userId'   : req.user.userId
    }, process.env.KEY, {
        expiresInMinutes: 60 * 24 * 7
    })

    res.render('authCallback', { socialIcon: 'twitter', token: token })
})

// Instagram
router.get('/instagram', passport.authenticate('instagram', { session: false }))
router.get('/instagram/callback', passport.authenticate('instagram', {
    session: false
}), function (req, res){

    var token = jwt.sign({
        'provider' : req.user.provider,
        'userId'   : req.user.userId
    }, process.env.KEY, {
        expiresInMinutes: 60 * 24 * 7
    })

    res.render('authCallback', { socialIcon: 'instagram', token: token })
})


/**
 * Revoke
 *
 */
var Q = require('q'),
    User = require('../models/user').User,
    q_findOneAndRemove = Q.nbind(User.findOneAndRemove, User);

// Handing `provider` Params
router.param('provider', function (req, res, next, provider){

    req.olProvider = provider

    next()
})

router.delete('/revoke/:provider', function (req, res, next){
    var provider = req.olProvider,
        id       = provider + req.olPassports[provider]

    q_findOneAndRemove({id: id})
    .then(function (data){
        res.json({code: 200})
    })
    .fail(function (err){
        next(err)
    })
})

module.exports = router