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
router.get('/instagram', passport.authenticate('instagram', {
    scope: ['comments', 'likes'],
    session: false 
}))
router.get('/instagram/callback', passport.authenticate('instagram', {
    scope: ['comments', 'likes'],
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



module.exports = router