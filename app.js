var express = require("express"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    passport = require("passport"),
    Strategy = require("passport-twitter").Strategy,
    session = require("express-session"),
    morgan = require("morgan"),
    cookieParser = require("cookie-parser"),
    twitter = require("twitter"),
    async = require("async"),
    _ = require("underscore"),
    config,
    app = express();

if (process.env.environment === "dev") {
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
    async.parallel({
        favs: function(cb) {
            var params = {
                screen_name: req.body.twithandle.slice(1),
                count: 4
            };
            twitter_api.get('favorites/list', params, function(error, tweets, response) {
                if (!error) {
                    cb(null, tweets);
                }
                else {
                    cb(null, error);
                }
            });
        },
        pop: function(cb) {
            var params = {
                screen_name: req.body.twithandle.slice(1),
                count: 200
            };
            twitter_api.get('statuses/user_timeline', params, function(error, tweets, response) {
                if (!error) {
                    cb(null, _.sortBy(tweets, function(tweet) {
                        return tweet.favorites_count + tweet.statuses_count;
                    }).splice(0, 3));
                }
                else {
                    cb(null, error);
                }
            });
        },
        recent: function(cb) {
            var params = {
                screen_name: req.body.twithandle.slice(1),
                count: 3
            };
            twitter_api.get('statuses/user_timeline', params, function(error, tweets, response) {
                if (!error) {
                    cb(null, tweets);
                }
                else {
                    cb(null, error);
                }
            });
        }
    }, function(error, results) {
        var ret_list = [results.favs, results.pop, results.recent];
        var tweet_list = new Array();
        ret_list.forEach(function(list) {
            list.forEach(function(tweet) {
                tweet_list.push(tweet);
            });
        });
        tweet_list = _.uniq(tweet_list, 'text');
        var oembed_tweet_list = new Array();
        async.forEachOf(tweet_list, function(elem, key, cb) {
            var new_params = {
                url: "https://www.twitter.com/filler/status/" + elem.id_str,
                omit_script: 1
            };
            twitter_api.get('statuses/oembed', new_params, function(error, output, response) {
                if (!error) {
                    oembed_tweet_list.push(output.html);
                    return cb(null);
                }
                else {
                    return cb(error);
                }
            });
        }, function(error) {
            if (!error) {
                res.render("index", {
                    user: req.user,
                    tweet_list: oembed_tweet_list,
                    searched: true,
                    search_q: req.body.twithandle
                });
            }
            else {
                console.log(error);
            }
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
