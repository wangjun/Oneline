/* /upload */
var fs      = require('fs'),
    router  = require('express').Router(),
    multer  = require('multer'),
    upload  = require('./helper/upload');

var upload2Local = multer({
    storage: multer.diskStorage({
        destination: process.env.PWD + '/routes/tmp',
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now())
        }
    })
})

// Handing `provider` Params
router.param('provider', function (req, res, next, provider){

    req.olProvider = provider

    next()
})

router.post('/:provider', function (req, res, next){

    upload2Local.single('twitterMedia')(req, res, function (err){
        if (err){
            next(err)
        } else {

            var provider = req.olProvider;
            q_userFindOne({ id: provider + req.olPassports[provider] })
            .then(function (found){

                return upload[provider]({
                    token      : found.token,
                    tokenSecret: found.tokenSecret,
                    filePath   : req.file.path
                })
            })
            .then(function (data){
                res.json(data)
            })
            .fail(function (err){
                next(err)
            })
            .finally(function (){
                fs.unlinkSync(req.file.path)
            })
        }
    })

})

module.exports = router