/* /auth */
var passport = require('passport'),
    jwt      = require('jsonwebtoken'),
    router   = require('express').Router();

// Handing `provider` Params
router.param('provider', function (req, res, next, provider){
    var providerList = ['twitter', 'instagram', 'weibo'];

    if (providerList.indexOf(provider) >= 0){
        req.olProvider = provider
        next()
    } else {
        next({ code: 400, msg: 'bad syntax' })
    }
})

/**
 * Auth
 *
 */
router.get('/:provider', function (req, res, next){
    passport.authenticate(req.olProvider, { session: false })(req, res, next)
})
router.get('/:provider/callback', function (req, res, next){
    passport.authenticate(req.olProvider, {
        session: false
    })(req, res, next)
}, function (req, res){

    var token = jwt.sign({
        'provider' : req.user.provider,
        'userId'   : req.user.userId
    }, process.env.KEY, {
        expiresInMinutes: 60 * 24 * 7
    })

    res.render('authCallback', { socialIcon: req.olProvider, token: token })
})


/**
 * Revoke
 *
 */
router.delete('/revoke/:provider', function (req, res, next){
    var provider = req.olProvider,
        id       = provider + req.olPassports[provider]

    q_userFindOneAndRemove({id: id})
    .then(function (){
        res.json({code: 200})
    })
    .fail(function (err){
        next(err)
    })
})

module.exports = router