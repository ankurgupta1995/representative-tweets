var express = require("express"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    passport = require("passport"),
    Strategy = require("passport-twitter").Strategy,
    session = require("express-session"),
    morgan = require("morgan"),
    cookieParser = require("cookie-parser"),
    twitter = require("twitter"),
    config,
    app = express();

if (process.env.environment == "dev") {
    config = require("./config")
}

//App config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressSanitizer());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(session({
    secret: 'Auth for representative tweets',
    resave: true,
    saveUninitialized: true
}));

var twitter_api = new twitter({
    consumer_key: process.env.consumerKey || config.consumerKey,
    consumer_secret: process.env.consumerSecret || config.consumerSecret,
    access_token_key: process.env.access_token_key || config.access_token_key,
    access_token_secret: process.env.access_token_secret || config.access_token_secret
});

passport.use(new Strategy({
    consumerKey: process.env.consumerKey || config.consumerKey,
    consumerSecret: process.env.consumerSecret || config.consumerSecret,
    callbackURL: process.env.callbackURL || config.callbackURL
}, function(token, tokenSecret, profile, cb) {
    process.nextTick(function() {
        twitter_api.access_token_key = token;
        twitter_api.access_token_secret = tokenSecret;
        return cb(null, profile);
    });
}));


passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res) {
    res.render("index", {
        user: req.user,
        tweets: null,
        searched: false
    });
});


app.get('/login', function(req, res) {
    res.redirect('/auth/twitter');
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login'
}), function(req, res) {
    res.redirect('/');
});

app.post('/', function(req, res) {
    var tweets;
    var params = {
        screen_name: req.body.twithandle.slice(1),
        count: 7
    };
    console.log(params);
    twitter_api.get('favorites/list', params, function(error, tweets, response) {
        var api_response
        if (!error) {
            api_response = tweets;
            console.log(api_response.length);
        }
        else {
            console.log(error);
        }
        res.render("index", {
            user: req.user,
            tweets: api_response,
            searched: true
        });
    });
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server started!");
});
