//local variables
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


// load dotenv
require('dotenv').load()

// Authentication strategies
require('./others/strategies')(passport)


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
    console.log(err)

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


process.on('uncaughtException', function (err) {
    console.log(err)
});

app.listen(process.env.PORT || 3000)