/* /auth */
var passport = require('passport'),
    jwt      = require('jsonwebtoken'),
    router   = require('express').Router();


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



module.exports = router