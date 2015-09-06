// local variables
var express      = require('express'),
    app          = express(),
    res_time     = require('response-time'),
    favicon      = require('serve-favicon'),
    bodyParser   = require('body-parser'),
    session      = require('express-session'),
    cookieParser = require('cookie-parser'),
    mongoose     = require('mongoose'),
    morgan       = require('morgan'),
    helmet       = require('helmet'),
    passport     = require('passport'),
    compress     = require('compression');

// global variables
global.Q = require('q')
global.User = require('./models/user').User
global.q_userFindOne = Q.nbind(User.findOne, User)
global.q_userFindOneAndRemove = Q.nbind(User.findOneAndRemove, User)
global.q_userFindOneAndUpdate = Q.nbind(User.findOneAndUpdate, User)


// load dotenv
require('dotenv').load()

// Authentication strategies
require('./strategies/strategies')(passport)


// read database config form VCAP_SERVICES env
var db_uri = process.env.MONGODB
    ? JSON.parse(process.env.MONGODB).uri
    : 'mongodb://test:test@localhost:27017/test'


// Connect to DB
mongoose.connect(db_uri);

var db = mongoose.connection
.on('err', function (err){
    console.error(err)
})
.once('open', function (){
    console.log('Connected to MongoDB')
})


// App Settings
app.set('trust proxy', true)


// Middleware
app.use(compress())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(res_time())
app.use(favicon(__dirname + '/public/img/favicon.ico'))
app.use(morgan(':remote-addr [:date[clf]] :method :url', {
    immediate: true,
    skip: function (req, res){
        return /\/auth\/\w+\/callback/.test(req.originalUrl)
    }
}))
app.use(helmet())
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))
app.use(helmet.contentSecurityPolicy({
    defaultSrc: ["'self'"],
    // styleSrc: ["'self'", "'unsafe-inline'"],
    // scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    imgSrc: ["*"],
    mediaSrc: ["*"],
    connectSrc: ['*'],
    reportOnly: false,
    setAllHeaders: false,
    disableAndroid: false,
    safari5: false
}));


// Template engines
app.set('views', './views')
app.set('view engine', 'jade')


// 保護 endpoints
var jwt = require('jsonwebtoken');
app.use(['/timeline', '/actions', '/auth/revoke'], function (req, res, next){
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

// Routing
app.use('/auth', require('./routes/auth'))
app.use('/timeline', require('./routes/timeline'))
app.use('/actions', require('./routes/actions'))
app.use('/public', express.static('public'))
app.all('/*', function (req, res, next){
    res.sendFile(__dirname + '/views/index.min.html')
})


// Handing Error
app.use(function (req, res){
    res.status('404').sendFile(__dirname + '/views/404.min.html')
})
app.use(function (err, req, res, next){
    console.log(err, err.stack)

    var statusCode = err.code || err.status;

    switch (statusCode){
        case 400:
            res.status(statusCode).json({'status': 'error', 'msg': err.msg})
            break;
        case 401:
            res.status(statusCode).json({'status': 'error','msg': err.message})
            break;
        case 500:
            res.status(statusCode).json({'status': 'error', 'msg': err.msg})
            break;
        default:
            res.status(500).json({'status': 'error', 'msg': 'server error'})

    }
})


app.listen(process.env.PORT || 3000)