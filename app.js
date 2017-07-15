var express = require("express"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    passport = require("passport"),
    Strategy = require("passport-twitter").Strategy,
    session = require("express-session"),
    morgan = require("morgan"),
    cookieParser = require("cookie-parser"),
    config = require("./config"),
    app = express();

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

passport.use(new Strategy({
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    callbackURL: config.callbackURL
}, function(token, tokenSecret, profile, cb) {
    process.nextTick(function() {
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
    res.render("index", {
        user: req.user,
        tweets: tweets,
        searched: true
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
