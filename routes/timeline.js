/* /timeline */
var jwt    = require('jsonwebtoken'),
    router = require('express').Router();

// 保護 endpoints
router.use(function (req, res, next){
    var tokenList = JSON.parse(req.headers.authorization.split(' ')[1]) || []

    tokenList.forEach(function (token){
        console.log(token)
    })

    next()
})

router.param('id', function (req, res, next, id){
    console.log('+++++++++++++++++++', id)
    next()
})
router.get('/:id', function (req, res, next){
    console.log('-------------------', req.params)
    res.json({data: 'data....'})
})


module.exports = router