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



router.get('/twitter/test', function (req, res){
    var token = jwt.sign({
        'provider' : 'twitter',
        'userId'   : '2373500364'
    }, process.env.KEY, {
        expiresInMinutes: 60 * 24 * 7
    })
    res.render('authCallback', { socialIcon: 'twitter', token: token })
})
router.get('/instagram/test', function (req, res){

    var token = jwt.sign({
        'provider' : 'instagram',
        'userId'   : '12362452412'
    }, process.env.KEY, {
        expiresInMinutes: 60 * 24 * 7
    })

    res.render('authCallback', { socialIcon: 'instagram', token: token})
})
router.get('/weibo/test', function (req, res){
    var token = jwt.sign({
        'provider' : 'weibo',
        'userId'   : 'sdasdad12424'
    }, process.env.KEY, {
        expiresInMinutes: 1
    })
    res.render('authCallback', { socialIcon: 'weibo', token: token})
})



module.exports = router